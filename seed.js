import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Configurazione Supabase (Usa le chiavi del tuo progetto)
const supabaseUrl = 'https://amwerhazkudezsrupfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtd2VyaGF6a3VkZXpzcnVwZnJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU0ODQyMCwiZXhwIjoyMDg4MTI0NDIwfQ.a_a49raR156yNOsTFYj6Mh9w7Prz8uSayRqex4CsgO0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCourses() {
    try {
        console.log("⏳ Avvio lettura file elenco_corsi.txt...");
        const fileContent = fs.readFileSync('elenco_corsi.txt', 'utf-8');
        const lines = fileContent.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Salta righe vuote
            if (!line) continue;

            const parts = line.split(',').map(s => s.trim());

            // Verifica che la riga abbia tutti i campi necessari
            if (parts.length < 7) {
                console.warn(`⚠️ Riga ${i + 1} malformata, saltata: ${line}`);
                continue;
            }

            const name = parts[0];
            const level = parts[1];
            const maxParticipants = parseInt(parts[2], 10);

            // parts[3] è Data_Scartare, ignoriamo questo campo nel database

            // Format datetime by replacing slashes with dashes for PostgreSQL compatibility
            let startTime = parts[4].replace(/\//g, '-');
            let endTime = parts[5].replace(/\//g, '-');

            const coachName = parts[6];

            // 1. Cerca l'ID dell'allenatore nella tabella profiles basato sul full_name esatto
            const { data: profiles, error: profileErr } = await supabase
                .from('profiles')
                .select('id')
                .eq('full_name', coachName);

            if (profileErr) {
                console.error(`❌ Errore sistema ricerca coach ${coachName} alla riga ${i + 1}: ${profileErr.message}`);
                continue;
            }

            if (!profiles || profiles.length === 0) {
                console.error(`❌ Errore: coach non trovato per la riga ${i + 1} ("${coachName}")`);
                continue;
            }

            const coachId = profiles[0].id;

            // 2. Inserimento record in courses
            const { error: insertErr } = await supabase
                .from('courses')
                .insert({
                    name: name,
                    level: level,
                    max_participants: maxParticipants,
                    start_time: startTime,
                    end_time: endTime,
                    coach_id: coachId
                });

            if (insertErr) {
                console.error(`❌ Errore inserimento corso "${name}": ${insertErr.message}`);
            } else {
                console.log(`✅ Corso inserito: ${name}`);
            }
        }

        console.log("🎉 Processo di importazione (seeding) terminato!");

    } catch (e) {
        console.error("🔥 Errore critico di sistema durante l'esecuzione:", e);
    }
}

// Avvio dello script
seedCourses();
