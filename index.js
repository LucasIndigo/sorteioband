import express from "express";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const app = express();
const port = process.env.PORT || 3000;

// --- Supabase ---
const supabase = createClient(
  "https://qvlfdxyawrikfqowkwjy.supabase.co",
  "SUA_API_KEY_AQUI"
);

// --- Google Sheets ---
const auth = new google.auth.GoogleAuth({
  keyFile: "service_account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

app.get("/participantes", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "ID_DA_SUA_PLANILHA",
      range: "Form Responses 1",
    });

    const rows = response.data.values;
    if (!rows.length) return res.json([]);

    const data = rows.slice(1).map(r => ({
      nome: r[0],
      telefone: r[1],
      instagram: r[2],
    }));

    // Inserir no Supabase
    for (const row of data) {
      await supabase.from("Participantes").insert([row]);
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao importar dados");
  }
});

app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
