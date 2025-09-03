import express from "express";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const app = express();
const port = process.env.PORT || 3000;

// --- Supabase ---
const supabase = createClient(
  "https://qvlfdxyawrikfqowkwjy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bGZkeHlhd3Jpa2Zxb3drd2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzEwNjYsImV4cCI6MjA3MjI0NzA2Nn0.rSKG5kIv2AEZ7MgD-H4KXSwKAJXUIQMxU8ZQKgCePD8"
);

// --- Google Sheets ---
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

const sheets = google.sheets({ version: "v4", auth });

// Substitua pelo ID da sua planilha
const SPREADSHEET_ID = "1WLV0MNzw_91W0ZQJ1QN1eOk3fD6oRw-lIRGr4S1qfWk";
const RANGE = "Página1!B:D"; // Ajuste conforme suas colunas: A=nome, B=telefone, C=instagram

app.get("/participantes", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE
    });

    const rows = response.data.values;
    if (!rows.length) return res.json([]);

    const data = rows.slice(1).map(r => ({
      nome: r[0] || "",
      telefone: r[1] || "",
      instagram: r[2] || ""
    }));

   // Inserir no Supabase
for (const row of data) {
  const { error } = await supabase.from("participantes").insert([row]);
  if (error) {
    console.error("Erro ao inserir:", error.message);
    return res.status(500).json({ error: error.message });
  }
}



    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao importar dados");
  }
});

app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
