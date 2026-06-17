import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Local persistent storage in-memory for our mock Payment Gateway
interface Payment {
  id: string;
  valor: number;
  metodo: "pix" | "credito" | "debito";
  parcelas: number;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
}

const paymentsDB: Map<string, Payment> = new Map();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Backend Endpoints

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get active payments log
  app.get("/api/pagamentos", (req: Request, res: Response) => {
    res.json(Array.from(paymentsDB.values()));
  });

  // Get single payment status (with client polling support)
  app.get("/api/pagamentos/status/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const payment = paymentsDB.get(id);
    if (!payment) {
      res.status(404).json({ error: "Pagamento não encontrado" });
      return;
    }
    res.json(payment);
  });

  // Helper function to simulate a gateway webhook notification calling our own server
  const triggerSimulatedWebhook = async (paymentId: string) => {
    setTimeout(async () => {
      const payment = paymentsDB.get(paymentId);
      if (payment && payment.status === "pending") {
        console.log(`[Webhook Simulator] Triggering mock hook to auto-approve payment ID: ${paymentId}`);
        // Let's call the webhook endpoint or update the status directly while simulating webhook logs!
        try {
          const body = {
            id: `wh-evt-${Date.now()}`,
            type: "payment",
            action: "payment.created",
            data: {
              id: paymentId,
              status: "approved"
            }
          };

          // To call webhook, we can trigger an internal POST request or perform it directly
          const paymentToUpdate = paymentsDB.get(paymentId);
          if (paymentToUpdate) {
            paymentToUpdate.status = "approved";
            paymentToUpdate.updatedAt = new Date().toISOString();
            paymentsDB.set(paymentId, paymentToUpdate);
            console.log(`[Webhook Simulator] Successful update through webhook simulator: ${paymentId} is now APPROVED.`);
          }
        } catch (err) {
          console.error("[Webhook Simulator] Failed simulated trigger", err);
        }
      }
    }, 6000); // Wait 6 seconds for PIX simulation
  };

  // CREATE PAYMENT: POST /pagamentos/criar & POST /api/pagamentos/criar
  const createPaymentHandler = (req: Request, res: Response) => {
    try {
      const { valor, metodo, parcelas } = req.body;

      if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) {
        res.status(400).json({ error: "Valor inválido" });
        return;
      }

      if (!["pix", "credito", "debito"].includes(metodo)) {
        res.status(400).json({ error: "Método de pagamento inválido" });
        return;
      }

      const parsedValue = Number(valor);
      const parsedInstallments = Number(parcelas) || 1;

      // Unique payment ID from gateway
      const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

      // Default status
      let status: "approved" | "pending" | "rejected" = "pending";

      // If credit or debit: authorize instantly (unless specified rejected)
      if (metodo === "credito" || metodo === "debito") {
        // Simple test logic: if valuation decimals are .99, simulate a rejected card for high-fidelity testing!
        if (parsedValue % 1 > 0.98) {
          status = "rejected";
        } else {
          status = "approved";
        }
      } else if (metodo === "pix") {
        status = "pending";
      }

      const newPayment: Payment = {
        id: paymentId,
        valor: parsedValue,
        metodo: metodo as any,
        parcelas: parsedInstallments,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      paymentsDB.set(paymentId, newPayment);

      // Generate actual payload for PIX copy-and-paste
      // Format mimicking real Brazilian PIX static payload
      const qrCodePayload = `00020101021226830014br.gov.bcb.pix25610017joao.digitronbalancas@gmail.com1234520400005303986540${parsedValue.toFixed(2)}5802BR5909VOGUEShop6009Sao Paulo62070503PDV6304EDFF`;
      const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(qrCodePayload)}`;

      // Respond to client
      const responsePayload = {
        id: paymentId,
        valor: parsedValue,
        metodo,
        parcelas: parsedInstallments,
        status,
        qrCode: metodo === "pix" ? qrCodeImage : null,
        copyPastePix: metodo === "pix" ? qrCodePayload : null,
        message: status === "approved" 
          ? "Pagamento aprovado com sucesso via Adquirente." 
          : status === "rejected" 
            ? "Transação recusada pela instituição emissora do cartão." 
            : "Aguardando confirmação do PIX..."
      };

      res.status(201).json(responsePayload);

      // If pending PIX, trigger async webhook simulation to approve it
      if (status === "pending") {
        triggerSimulatedWebhook(paymentId);
      }
    } catch (error: any) {
      res.status(500).json({ error: "Erro interno ao processar pagamento", details: error?.message || error });
    }
  };

  app.post("/api/pagamentos/criar", createPaymentHandler);
  app.post("/pagamentos/criar", createPaymentHandler);

  // WEBHOOK: POST /pagamentos/webhook & POST /api/pagamentos/webhook
  const webhookHandler = (req: Request, res: Response) => {
    try {
      console.log("[Webhook Received] Headers:", req.headers);
      console.log("[Webhook Received] Body:", req.body);

      const { data, action } = req.body;
      const paymentId = data?.id;

      if (!paymentId) {
        res.status(400).json({ error: "Dados de pagamento ausentes na notificação." });
        return;
      }

      const payment = paymentsDB.get(paymentId);
      if (!payment) {
        res.status(404).json({ error: `Pagamento ${paymentId} não reconhecido.` });
        return;
      }

      // Update status
      if (data.status) {
        payment.status = data.status;
        payment.updatedAt = new Date().toISOString();
        paymentsDB.set(paymentId, payment);
        console.log(`[Webhook success] Updated payment ${paymentId} status to ${data.status}.`);
      }

      res.status(200).json({ success: true, message: "Webhook processado com sucesso" });
    } catch (error: any) {
      res.status(500).json({ error: "Erro ao processar webhook de pagamento", details: error?.message || error });
    }
  };

  app.post("/api/pagamentos/webhook", webhookHandler);
  app.post("/pagamentos/webhook", webhookHandler);

  // Serve Vite in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Configuring Vite Middleware in dev mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Configuring static file paths in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[POS Gateway Backend] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
