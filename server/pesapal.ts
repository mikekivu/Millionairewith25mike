import { Request, Response } from 'express';

export async function createPesapalOrder(req: Request, res: Response) {
  res.status(503).json({ error: "Payment services are temporarily disabled" });
}

export async function handlePesapalCallback(req: Request, res: Response) {
  const frontendUrl = `${req.protocol}://${req.get('host')}`;
  const redirectUrl = `${frontendUrl}/dashboard/wallet?payment=pesapal&status=failed&error=service_disabled`;
  res.redirect(redirectUrl);
}

export async function handlePesapalIPN(req: Request, res: Response) {
  res.status(503).json({ error: "Payment services are temporarily disabled" });
}

export async function getPesapalTransactionStatus(req: Request, res: Response) {
  res.status(503).json({ error: "Payment services are temporarily disabled" });
}