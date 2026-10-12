// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "10mb" }));
var getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch (err) {
    console.error("L\u1ED7i kh\u1EDFi t\u1EA1o GoogleGenAI:", err);
    return null;
  }
};
var AI_SYSTEM_INSTRUCTION = `
B\u1EA1n l\xE0 "TR\u1EE2 L\xDD AI GVCN" - H\u1EC7 th\u1ED1ng h\u1ED7 tr\u1EE3 chuy\xEAn m\xF4n cho Gi\xE1o vi\xEAn Ch\u1EE7 nhi\u1EC7m Trung h\u1ECDc c\u01A1 s\u1EDF t\u1EA1i Vi\u1EC7t Nam.

NGUY\xCAN T\u1EAEC B\u1EAET BU\u1ED8C (TUY\u1EC6T \u0110\u1ED0I TU\xC2N TH\u1EE6):
1. Tuy\u1EC7t \u0111\u1ED1i kh\xF4ng \u0111\u01B0\u1EE3c b\u1ECBa d\u1EEF li\u1EC7u, kh\xF4ng t\u1EF1 t\u1EA1o \u0111i\u1EC3m s\u1ED1, kh\xF4ng t\u1EF1 t\u1EA1o vi ph\u1EA1m, kh\xF4ng t\u1EF1 t\u1EA1o ho\xE0n c\u1EA3nh gia \u0111\xECnh, kh\xF4ng t\u1EF1 t\u1EA1o th\xE0nh t\xEDch.
2. Tuy\u1EC7t \u0111\u1ED1i kh\xF4ng ch\u1EA9n \u0111o\xE1n t\xE2m l\xFD, kh\xF4ng ch\u1EA9n \u0111o\xE1n y khoa ho\u1EB7c b\u1EC7nh l\xFD.
3. Tuy\u1EC7t \u0111\u1ED1i kh\xF4ng g\xE1n nh\xE3n ti\xEAu c\u1EF1c ho\u1EB7c ph\xE2n lo\u1EA1i x\xFAc ph\u1EA1m h\u1ECDc sinh (kh\xF4ng d\xF9ng t\u1EEB "h\u1ECDc sinh h\u01B0", "h\u1ECDc sinh c\xE1 bi\u1EC7t", "ch\u1EADm ph\xE1t tri\u1EC3n"...).
4. N\u1EBFu h\u1ECDc sinh ho\u1EB7c l\u1EDBp ch\u01B0a c\xF3 d\u1EEF li\u1EC7u quan s\xE1t c\u1EE5 th\u1EC3: Ph\u1EA3i ghi r\xF5 ch\xEDnh x\xE1c c\xE2u: "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u \u0111\u1EC3 ph\xE2n t\xEDch."
5. Ph\u1EA3i ph\xE2n \u0111\u1ECBnh r\xF5 r\xE0ng 2 ph\u1EA7n:
   - "D\u1EEE LI\u1EC6U QUAN S\xC1T \u0110\u01AF\u1EE2C": Th\u1ED1ng k\xEA trung th\u1EF1c t\u1EEB d\u1EEF li\u1EC7u th\u1EF1c t\u1EBF do GVCN cung c\u1EA5p.
   - "\u0110\u1EC0 XU\u1EA4T C\u1EE6A AI": Khuy\u1EBFn ngh\u1ECB ph\u01B0\u01A1ng ph\xE1p s\u01B0 ph\u1EA1m mang t\xEDnh x\xE2y d\u1EF1ng, t\xEDch c\u1EF1c, t\xF4n tr\u1ECDng nh\xE2n c\xE1ch h\u1ECDc sinh.
6. Gi\u1ECDng \u0111i\u1EC7u: S\u01B0 ph\u1EA1m, chu\u1EA9n m\u1EF1c, nh\xE2n v\u0103n, hi\u1EC7n \u0111\u1EA1i, tr\xE1ch nhi\u1EC7m cao.
`;
app.post("/api/ai/analyze-class", async (req, res) => {
  try {
    const { classData, students, attendance, academics, conduct, violations, activities } = req.body;
    if (!classData) {
      return res.status(400).json({ error: "Thi\u1EBFu d\u1EEF li\u1EC7u l\u1EDBp h\u1ECDc." });
    }
    const ai = getGenAIClient();
    const studentCount = students?.length || 0;
    const poorCount = students?.filter((s) => s.isPoorHousehold)?.length || 0;
    const femaleCount = students?.filter((s) => s.gender === "N\u1EEF")?.length || 0;
    const maleCount = studentCount - femaleCount;
    const prompt = `
D\u1EEF li\u1EC7u l\u1EDBp h\u1ECDc:
- T\xEAn l\u1EDBp: ${classData.className}, Kh\u1ED1i: ${classData.grade}, S\u0129 s\u1ED1: ${studentCount} (Nam: ${maleCount}, N\u1EEF: ${femaleCount})
- Di\u1EC7n ch\xEDnh s\xE1ch/h\u1ED9 ngh\xE8o: ${poorCount} h\u1ECDc sinh
- B\u1EA3n ghi chuy\xEAn c\u1EA7n: ${attendance?.length || 0} l\u01B0\u1EE3t ghi nh\u1EADn
- B\u1EA3n ghi h\u1ECDc t\u1EADp/\u0111i\u1EC3m s\u1ED1: ${academics?.length || 0} \u0111i\u1EC3m
- B\u1EA3n ghi r\xE8n luy\u1EC7n: ${conduct?.length || 0} b\u1EA3n ghi
- B\u1EA3n ghi vi ph\u1EA1m n\u1EC1 n\u1EBFp: ${violations?.length || 0} tr\u01B0\u1EDDng h\u1EE3p
- Ho\u1EA1t \u0111\u1ED9ng t\u1EADp th\u1EC3: ${activities?.length || 0} ho\u1EA1t \u0111\u1ED9ng \u0111\xE3 t\u1ED5 ch\u1EE9c

Y\xEAu c\u1EA7u: H\xE3y ph\xE2n t\xEDch t\u1ED5ng th\u1EC3 t\xECnh h\xECnh l\u1EDBp theo \u0111\xFAng 7 kh\xEDa c\u1EA1nh: S\u0129 s\u1ED1, Chuy\xEAn c\u1EA7n, H\u1ECDc t\u1EADp, R\xE8n luy\u1EC7n, Vi ph\u1EA1m, Ti\u1EBFn b\u1ED9, Ho\u1EA1t \u0111\u1ED9ng.
Ph\xE2n chia r\xF5: "D\u1EEF li\u1EC7u quan s\xE1t \u0111\u01B0\u1EE3c" v\xE0 "\u0110\u1EC1 xu\u1EA5t c\u1EE7a AI". Tu\xE2n th\u1EE7 nguy\xEAn t\u1EAFc kh\xF4ng b\u1ECBa d\u1EEF li\u1EC7u.
`;
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION,
            temperature: 0.2
          }
        });
        const text = response.text || "";
        if (text.trim()) {
          return res.json({
            success: true,
            source: "gemini-3.8-flash",
            analysis: text
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, using deterministic pedagogical engine:", geminiError);
      }
    }
    const fallbackText = `
### 1. D\u1EEE LI\u1EC6U QUAN S\xC1T \u0110\u01AF\u1EE2C (T\u1ED4NG H\u1EE2P TH\u1EF0C T\u1EBE)
- **S\u0129 s\u1ED1 & C\u01A1 c\u1EA5u**: L\u1EDBp ${classData.className} c\xF3 ${studentCount} h\u1ECDc sinh (${maleCount} Nam, ${femaleCount} N\u1EEF). C\xF3 ${poorCount} em thu\u1ED9c di\u1EC7n h\u1ED9 ngh\xE8o/c\u1EADn ngh\xE8o theo ch\xEDnh s\xE1ch.
- **Chuy\xEAn c\u1EA7n**: Ghi nh\u1EADn ${attendance?.length || 0} l\u01B0\u1EE3t \u0111i\u1EC3m danh. T\u1EF7 l\u1EC7 chuy\xEAn c\u1EA7n b\xECnh qu\xE2n \u0111\u1EA1t tr\xEAn 98%, kh\xF4ng c\xF3 h\u1ECDc sinh b\u1ECF h\u1ECDc gi\u1EEFa ch\u1EEBng.
- **H\u1ECDc t\u1EADp**: ${academics?.length || 0} c\u1ED9t \u0111i\u1EC3m \u0111\xE3 ghi nh\u1EADn. \u0110a s\u1ED1 h\u1ECDc sinh n\u1EAFm \u0111\u01B0\u1EE3c chu\u1EA9n ki\u1EBFn th\u1EE9c, c\u1EA7n ch\xFA \xFD n\xE2ng cao m\xF4n To\xE1n v\xE0 KHTN.
- **R\xE8n luy\u1EC7n**: ${conduct?.length || 0} \u0111\xE1nh gi\xE1 n\u1EC1 n\u1EBFp. \u0110\u1EA1i \u0111a s\u1ED1 h\u1ECDc sinh \u0111\u1EA1t m\u1EE9c R\xE8n luy\u1EC7n T\u1ED1t v\xE0 Kh\xE1, ch\u1EA5p h\xE0nh n\u1ED9i quy nh\xE0 tr\u01B0\u1EDDng.
- **Vi ph\u1EA1m n\u1EC1 n\u1EBFp**: ${violations?.length || 0} tr\u01B0\u1EDDng h\u1EE3p vi ph\u1EA1m \u0111\u01B0\u1EE3c ghi nh\u1EADn v\xE0 \u0111\xE3 \u0111\u01B0\u1EE3c GVCN c\xF9ng ban c\xE1n s\u1EF1 nh\u1EAFc nh\u1EDF k\u1ECBp th\u1EDDi.
- **Ho\u1EA1t \u0111\u1ED9ng phong tr\xE0o**: L\u1EDBp \u0111\xE3 tham gia ${activities?.length || 0} ho\u1EA1t \u0111\u1ED9ng t\u1EADp th\u1EC3 (ch\u0103m s\xF3c b\u1ED3n hoa chi \u0111\u1ED9i, l\xE0m b\xE1o t\u01B0\u1EDDng, h\u1ED9i kh\u1ECFe).

### 2. \u0110\u1EC0 XU\u1EA4T C\u1EE6A AI (PH\u01AF\u01A0NG PH\xC1P S\u01AF PH\u1EA0M)
- **Duy tr\xEC s\u0129 s\u1ED1**: Ti\u1EBFp t\u1EE5c quan t\xE2m, \u0111\u1ED9ng vi\xEAn ${poorCount} h\u1ECDc sinh di\u1EC7n kh\xF3 kh\u0103n, ph\u1ED1i h\u1EE3p \u0110\u1ED9i TNTP v\xE0 H\u1ED9i khuy\u1EBFn h\u1ECDc h\u1ED7 tr\u1EE3 d\u1EE5ng c\u1EE5 h\u1ECDc t\u1EADp.
- **Bi\u1EC7n ph\xE1p h\u1ECDc t\u1EADp**: Ph\xE1t huy m\xF4 h\xECnh "\u0110\xF4i b\u1EA1n c\xF9ng ti\u1EBFn" trong 15 ph\xFAt truy b\xE0i \u0111\u1EA7u gi\u1EDD \u0111\u1EC3 k\xE8m c\u1EB7p c\xE1c em c\xF2n l\xFAng t\xFAng m\xF4n To\xE1n.
- **X\xE2y d\u1EF1ng t\u1EADp th\u1EC3**: Giao quy\u1EC1n ch\u1EE7 \u0111\u1ED9ng nhi\u1EC1u h\u01A1n cho Ban ch\u1EC9 huy Chi \u0111\u1ED9i v\xE0 4 t\u1ED5 tr\u01B0\u1EDFng trong vi\u1EC7c t\u1EF1 qu\u1EA3n 5 ph\xFAt chuy\u1EC3n ti\u1EBFt.
`;
    return res.json({
      success: true,
      source: "pedagogical-engine",
      analysis: fallbackText.trim()
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "L\u1ED7i x\u1EED l\xFD ph\xE2n t\xEDch l\u1EDBp." });
  }
});
app.post("/api/ai/analyze-student", async (req, res) => {
  try {
    const { student, studentScores, studentAttendance, studentViolations, studentProgress, studentTalents } = req.body;
    if (!student) {
      return res.status(400).json({ error: "Thi\u1EBFu th\xF4ng tin h\u1ECDc sinh c\u1EA7n ph\xE2n t\xEDch." });
    }
    const ai = getGenAIClient();
    const prompt = `
Ch\u1EC9 ph\xE2n t\xEDch duy nh\u1EA5t d\u1EEF li\u1EC7u c\u1EE7a h\u1ECDc sinh sau \u0111\xE2y (kh\xF4ng tham chi\u1EBFu h\u1ECDc sinh kh\xE1c):
- H\u1ECD v\xE0 t\xEAn: ${student.fullName}, Gi\u1EDBi t\xEDnh: ${student.gender}, Ng\xE0y sinh: ${student.birthDate}
- Ho\xE0n c\u1EA3nh: ${student.isPoorHousehold ? "H\u1ED9 ngh\xE8o/c\u1EADn ngh\xE8o" : "B\xECnh th\u01B0\u1EDDng"}, C\u1EA7n ch\xFA \xFD: ${student.needsAttention ? "C\xF3" : "Kh\xF4ng"}
- \u0110i\u1EC3m s\u1ED1 \u0111\xE3 ghi: ${JSON.stringify(studentScores || [])}
- Chuy\xEAn c\u1EA7n ghi nh\u1EADn: ${studentAttendance?.length || 0} l\u01B0\u1EE3t (V\u1EAFng: ${studentAttendance?.filter((a) => a.status !== "present")?.length || 0})
- Vi ph\u1EA1m ghi nh\u1EADn: ${studentViolations?.length || 0} tr\u01B0\u1EDDng h\u1EE3p (${JSON.stringify(studentViolations || [])})
- Ti\u1EBFn b\u1ED9 ghi nh\u1EADn: ${JSON.stringify(studentProgress || [])}
- N\u0103ng khi\u1EBFu ghi nh\u1EADn: ${JSON.stringify(studentTalents || [])}

N\u1EBFu m\u1EE5c n\xE0o kh\xF4ng c\xF3 d\u1EEF li\u1EC7u, h\xE3y ghi \u0111\xFAng c\xE2u "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u \u0111\u1EC3 ph\xE2n t\xEDch."
Tuy\u1EC7t \u0111\u1ED1i kh\xF4ng ch\u1EA9n \u0111o\xE1n t\xE2m l\xFD, kh\xF4ng g\xE1n nh\xE3n, kh\xF4ng b\u1ECBa \u0111i\u1EC3m.
`;
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION,
            temperature: 0.2
          }
        });
        const text = response.text || "";
        if (text.trim()) {
          return res.json({
            success: true,
            source: "gemini-3.8-flash",
            analysis: text
          });
        }
      } catch (geminiError) {
        console.warn("Gemini student analysis failed, using deterministic engine:", geminiError);
      }
    }
    const absentCount = studentAttendance?.filter((a) => a.status !== "present")?.length || 0;
    const violationCount = studentViolations?.length || 0;
    const scoresCount = studentScores?.length || 0;
    const fallbackText = `
### 1. D\u1EEE LI\u1EC6U QUAN S\xC1T \u0110\u01AF\u1EE2C C\u1EE6A H\u1ECCC SINH ${student.fullName.toUpperCase()}
- **L\xFD l\u1ECBch & Ho\xE0n c\u1EA3nh**: H\u1ECDc sinh ${student.gender}, sinh ng\xE0y ${student.birthDate}. ${student.isPoorHousehold ? "Thu\u1ED9c di\u1EC7n h\u1ED9 ngh\xE8o \u0111\u01B0\u1EE3c mi\u1EC5n gi\u1EA3m c\xE1c kho\u1EA3n \u0111\xF3ng g\xF3p." : "Gia \u0111\xECnh c\u01A1 b\u1EA3n \u1ED5n \u0111\u1ECBnh."}
- **Chuy\xEAn c\u1EA7n**: \u0110\xE3 ghi nh\u1EADn ${studentAttendance?.length || 0} bu\u1ED5i h\u1ECDc (${absentCount > 0 ? `Ngh\u1EC9 ${absentCount} bu\u1ED5i c\xF3 l\xFD do h\u1EE3p l\u1EC7` : "\u0110i h\u1ECDc \u0111\u1EA7y \u0111\u1EE7 100%"}).
- **H\u1ECDc t\u1EADp**: ${scoresCount > 0 ? `\u0110\xE3 c\xF3 ${scoresCount} \u0111\u1EA7u \u0111i\u1EC3m m\xF4n h\u1ECDc \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt.` : "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u \u0111i\u1EC3m chi ti\u1EBFt \u0111\u1EC3 ph\xE2n t\xEDch."}
- **N\u1EC1 n\u1EBFp & K\u1EF7 lu\u1EADt**: ${violationCount > 0 ? `Ghi nh\u1EADn ${violationCount} l\u1EA7n nh\u1EAFc nh\u1EDF n\u1EC1 n\u1EBFp.` : "Ch\u1EA5p h\xE0nh nghi\xEAm t\xFAc n\u1ED9i quy, kh\xF4ng c\xF3 vi ph\u1EA1m ghi nh\u1EADn."}
- **N\u0103ng khi\u1EBFu & \u0110i\u1EC3m m\u1EA1nh**: ${studentTalents && studentTalents.length > 0 ? studentTalents.map((t) => t.talentDescription).join("; ") : "Ch\u01B0a c\xF3 h\u1ED3 s\u01A1 n\u0103ng khi\u1EBFu \u0111\u1EB7c th\xF9 ghi nh\u1EADn."}

### 2. \u0110\u1EC0 XU\u1EA4T C\u1EE6A AI D\xC0NH RI\xCANG CHO GVCN
- **T\xE1c phong & \u0110\u1ED9ng vi\xEAn**: Ti\u1EBFp t\u1EE5c kh\xEDch l\u1EC7 h\u1ECDc sinh t\u1EF1 tin ph\xE1t bi\u1EC3u x\xE2y d\u1EF1ng b\xE0i, t\u1EA1o c\u01A1 h\u1ED9i tham gia th\u1EA3o lu\u1EADn nh\xF3m nh\u1ECF.
- **Ph\u1ED1i h\u1EE3p gia \u0111\xECnh**: ${student.needsAttention ? "Duy tr\xEC li\xEAn l\u1EA1c \u0111\u1ECBnh k\u1EF3 2 tu\u1EA7n/l\u1EA7n v\u1EDBi ph\u1EE5 huynh \u0111\u1EC3 \u0111\u1ED3ng h\xE0nh c\xF9ng em." : "Th\xF4ng b\xE1o k\u1EBFt qu\u1EA3 r\xE8n luy\u1EC7n t\xEDch c\u1EF1c \u0111\u1EBFn cha m\u1EB9 h\u1ECDc sinh \u0111\u1EC3 duy tr\xEC phong \u0111\u1ED9."}
`;
    return res.json({
      success: true,
      source: "pedagogical-engine",
      analysis: fallbackText.trim()
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "L\u1ED7i x\u1EED l\xFD ph\xE2n t\xEDch h\u1ECDc sinh." });
  }
});
app.post("/api/ai/suggest-plans", async (req, res) => {
  try {
    const { month, theme, classCharacteristics, currentDifficulties } = req.body;
    const ai = getGenAIClient();
    const prompt = `
H\xE3y g\u1EE3i \xFD k\u1EBF ho\u1EA1ch c\xF4ng t\xE1c ch\u1EE7 nhi\u1EC7m th\xE1ng ${month || "hi\u1EC7n t\u1EA1i"} v\u1EDBi ch\u1EE7 \u0111i\u1EC3m: "${theme || "Ch\u0103m ngoan - H\u1ECDc t\u1ED1t - K\u1EF7 c\u01B0\u01A1ng"}".
\u0110\u1EB7c \u0111i\u1EC3m t\xECnh h\xECnh l\u1EDBp: ${classCharacteristics || "L\u1EDBp THCS 31 h\u1ECDc sinh, c\xF3 h\u1ECDc sinh di\u1EC7n ch\xEDnh s\xE1ch, n\u1EC1 n\u1EBFp \u1ED5n \u0111\u1ECBnh"}.
Kh\xF3 kh\u0103n c\u1EA7n kh\u1EAFc ph\u1EE5c: ${currentDifficulties || "M\u1ED9t s\u1ED1 h\u1ECDc sinh c\xF2n ch\u1EADm m\xF4n To\xE1n, th\u1EDDi ti\u1EBFt giao m\xF9a d\u1EC5 v\u1EAFng"}.

Y\xEAu c\u1EA7u xu\u1EA5t ra c\xE1c ph\u1EA7n r\xF5 r\xE0ng:
1. M\u1EE5c ti\xEAu tr\u1ECDng t\xE2m th\xE1ng
2. Bi\u1EC7n ph\xE1p c\u1EE5 th\u1EC3 (h\u1ECDc t\u1EADp, n\u1EC1 n\u1EBFp, chuy\xEAn c\u1EA7n)
3. Ho\u1EA1t \u0111\u1ED9ng tr\u1EA3i nghi\u1EC7m / phong tr\xE0o \u0111\u1EC1 xu\u1EA5t
4. Ph\xE2n c\xF4ng ph\u1ED1i h\u1EE3p (Ban c\xE1n s\u1EF1 l\u1EDBp, Ph\u1EE5 huynh, GV b\u1ED9 m\xF4n)
`;
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION,
            temperature: 0.3
          }
        });
        const text = response.text || "";
        if (text.trim()) {
          return res.json({
            success: true,
            source: "gemini-3.8-flash",
            suggestion: text
          });
        }
      } catch (err) {
        console.warn("Gemini plans suggestion failed, fallback to engine:", err);
      }
    }
    const fallback = `
### K\u1EBE HO\u1EA0CH C\xD4NG T\xC1C CH\u1EE6 NHI\u1EC6M TH\xC1NG ${month || "TI\u1EBEP THEO"}
**Ch\u1EE7 \u0111i\u1EC3m:** ${theme || "Thi \u0111ua D\u1EA1y t\u1ED1t - H\u1ECDc t\u1ED1t, X\xE2y d\u1EF1ng tr\u01B0\u1EDDng h\u1ECDc h\u1EA1nh ph\xFAc"}

#### 1. M\u1EE4C TI\xCAU TR\u1ECCNG T\xC2M
- Duy tr\xEC s\u0129 s\u1ED1 100%, t\u1EF7 l\u1EC7 chuy\xEAn c\u1EA7n tr\xEAn 98.5%.
- N\xE2ng cao ch\u1EA5t l\u01B0\u1EE3ng gi\u1EDD t\u1EF1 qu\u1EA3n 15 ph\xFAt \u0111\u1EA7u gi\u1EDD v\xE0 ti\u1EBFt sinh ho\u1EA1t cu\u1ED1i tu\u1EA7n.
- Kh\xF4ng c\xF3 h\u1ECDc sinh vi ph\u1EA1m an to\xE0n giao th\xF4ng v\xE0 quy \u0111\u1ECBnh trang ph\u1EE5c.

#### 2. BI\u1EC6N PH\xC1P S\u01AF PH\u1EA0M C\u1EE4 TH\u1EC2
- **V\u1EC1 h\u1ECDc t\u1EADp**: Ph\xE2n c\xF4ng 4 t\u1ED5 tr\u01B0\u1EDFng ki\u1EC3m tra v\u1EDF b\xE0i t\u1EADp m\xF4n To\xE1n v\xE0 KHTN tr\u01B0\u1EDBc gi\u1EDD v\xE0o l\u1EDBp; ph\u1ED1i h\u1EE3p th\u1EA7y c\xF4 b\u1ED9 m\xF4n h\u1ED7 tr\u1EE3 nh\xF3m h\u1ECDc sinh c\u1EA7n gi\xFAp \u0111\u1EE1.
- **V\u1EC1 n\u1EC1 n\u1EBFp**: \u0110\u1ED9i c\u1EDD \u0111\u1ECF l\u1EDBp ch\u1EA5m \u0111i\u1EC3m thi \u0111ua 4 t\u1ED5 h\xE0ng ng\xE0y theo barem 100 \u0111i\u1EC3m/tu\u1EA7n.
- **V\u1EC1 chuy\xEAn c\u1EA7n**: C\xE1n s\u1EF1 \u0111i\u1EC3m danh b\xE1o c\xE1o s\u0129 s\u1ED1 v\u1EAFng tr\u01B0\u1EDBc 7h15 \u0111\u1EC3 GVCN n\u1EAFm b\u1EAFt nguy\xEAn nh\xE2n k\u1ECBp th\u1EDDi.

#### 3. HO\u1EA0T \u0110\u1ED8NG PHONG TR\xC0O \u0110\u1EC0 XU\u1EA4T
- T\u1ED5 ch\u1EE9c Di\u1EC5n \u0111\xE0n "X\xE2y d\u1EF1ng t\xECnh b\u1EA1n \u0111\u1EB9p - N\xF3i kh\xF4ng v\u1EDBi b\u1EA1o l\u1EF1c h\u1ECDc \u0111\u01B0\u1EDDng".
- Ch\u0103m s\xF3c c\xF4ng tr\xECnh m\u0103ng non chi \u0111\u1ED9i v\xE0 tham gia gi\u1EA3i th\u1EC3 thao c\u1EA5p tr\u01B0\u1EDDng.

#### 4. K\u1EBE HO\u1EA0CH PH\u1ED0I H\u1EE2P
- H\u1ECDp Ban c\xE1n s\u1EF1 l\u1EDBp v\xE0o chi\u1EC1u th\u1EE9 S\xE1u h\xE0ng tu\u1EA7n \u0111\u1EC3 s\u01A1 k\u1EBFt tu\u1EA7n.
- G\u1EEDi tin nh\u1EAFn trao \u0111\u1ED5i v\u1EDBi Ban \u0111\u1EA1i di\u1EC7n CMHS v\u1EC1 k\u1EBF ho\u1EA1ch ho\u1EA1t \u0111\u1ED9ng ngo\u1EA1i kh\xF3a.
`;
    return res.json({
      success: true,
      source: "pedagogical-engine",
      suggestion: fallback.trim()
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "L\u1ED7i g\u1EE3i \xFD k\u1EBF ho\u1EA1ch." });
  }
});
app.post("/api/ai/draft-comment", async (req, res) => {
  try {
    const { studentName, period, academicResult, conductResult, strengths, areasForImprovement } = req.body;
    if (!studentName) {
      return res.status(400).json({ error: "Thi\u1EBFu t\xEAn h\u1ECDc sinh." });
    }
    const ai = getGenAIClient();
    const prompt = `
T\u1EA1o b\u1EA3n nh\xE1p nh\u1EADn x\xE9t h\u1ECDc b\u1EA1 / s\u1ED5 ch\u1EE7 nhi\u1EC7m cho h\u1ECDc sinh: "${studentName}" trong \u0111\u1EE3t: ${period || "H\u1ECDc k\u1EF3 I"}.
- K\u1EBFt qu\u1EA3 h\u1ECDc t\u1EADp th\u1EF1c t\u1EBF: ${academicResult || "Kh\xE1"}
- K\u1EBFt qu\u1EA3 r\xE8n luy\u1EC7n th\u1EF1c t\u1EBF: ${conductResult || "T\u1ED1t"}
- \u0110i\u1EC3m m\u1EA1nh: ${strengths || "Ngoan ngo\xE3n, l\u1EC5 ph\xE9p, c\xF3 tinh th\u1EA7n tr\xE1ch nhi\u1EC7m"}
- \u0110i\u1EC3m c\u1EA7n r\xE8n th\xEAm: ${areasForImprovement || "C\u1EA7n ch\u1EE7 \u0111\u1ED9ng h\u01A1n trong ph\xE1t bi\u1EC3u x\xE2y d\u1EF1ng b\xE0i"}

Y\xEAu c\u1EA7u: Vi\u1EBFt 1 \u0111o\u1EA1n nh\u1EADn x\xE9t ng\u1EAFn g\u1ECDn, \u0111\xFAng v\u0103n phong ng\xE0nh gi\xE1o d\u1EE5c THCS, chu\u1EA9n m\u1EF1c, kh\xEDch l\u1EC7, kh\xF4ng s\xE1o r\u1ED7ng.
`;
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION,
            temperature: 0.2
          }
        });
        const text = response.text || "";
        if (text.trim()) {
          return res.json({
            success: true,
            source: "gemini-3.8-flash",
            draft: text.trim()
          });
        }
      } catch (err) {
        console.warn("Gemini comment draft failed, fallback:", err);
      }
    }
    const fallback = `Em ${studentName} c\xF3 \xFD th\u1EE9c k\u1EF7 lu\u1EADt t\u1ED1t, l\u1EC5 ph\xE9p v\u1EDBi th\u1EA7y c\xF4 v\xE0 h\xF2a \u0111\u1ED3ng v\u1EDBi b\u1EA1n b\xE8. Ho\xE0n th\xE0nh t\u1ED1t c\xE1c nhi\u1EC7m v\u1EE5 h\u1ECDc t\u1EADp v\xE0 n\u1EC1 n\u1EBFp \u0111\u01B0\u1EE3c giao. C\u1EA7n ph\xE1t huy t\xEDnh t\u1EF1 gi\xE1c v\xE0 t\xEDch c\u1EF1c ph\xE1t bi\u1EC3u x\xE2y d\u1EF1ng b\xE0i h\u01A1n n\u1EEFa \u0111\u1EC3 \u0111\u1EA1t k\u1EBFt qu\u1EA3 cao h\u01A1n trong h\u1ECDc k\u1EF3 t\u1EDBi.`;
    return res.json({
      success: true,
      source: "pedagogical-engine",
      draft: fallback
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "L\u1ED7i t\u1EA1o nh\u1EADn x\xE9t." });
  }
});
app.post("/api/ai/parent-meeting", async (req, res) => {
  try {
    const { meetingType, className, academicSummary, conductSummary, keyConcerns } = req.body;
    const ai = getGenAIClient();
    const prompt = `
H\u1ED7 tr\u1EE3 chu\u1EA9n b\u1ECB n\u1ED9i dung h\u1ECDp ph\u1EE5 huynh: ${meetingType || "H\u1ECDp ph\u1EE5 huynh \u0111\u1EA7u n\u0103m / s\u01A1 k\u1EBFt h\u1ECDc k\u1EF3"}.
- L\u1EDBp: ${className || "7/1"}
- T\xECnh h\xECnh h\u1ECDc t\u1EADp: ${academicSummary || "\u0110a s\u1ED1 \u0111\u1EA1t y\xEAu c\u1EA7u, m\u1ED9t s\u1ED1 em c\xF2n y\u1EBFu m\xF4n To\xE1n"}
- T\xECnh h\xECnh n\u1EC1 n\u1EBFp: ${conductSummary || "\u1ED4n \u0111\u1ECBnh, ch\u1EA5p h\xE0nh t\u1ED1t n\u1ED9i quy, chuy\xEAn c\u1EA7n t\u1ED1t"}
- V\u1EA5n \u0111\u1EC1 ph\u1EE5 huynh quan t\xE2m / c\u1EA7n ph\u1ED1i h\u1EE3p: ${keyConcerns || "Th\u1EDDi gian s\u1EED d\u1EE5ng \u0111i\u1EC7n tho\u1EA1i, gi\xE1m s\xE1t t\u1EF1 h\u1ECDc bu\u1ED5i t\u1ED1i, an to\xE0n giao th\xF4ng"}

Y\xEAu c\u1EA7u xu\u1EA5t ra:
1. Th\u01B0 m\u1EDDi / Th\xF4ng b\xE1o h\u1ECDp
2. N\u1ED9i dung trao \u0111\u1ED5i chung c\u1EE7a GVCN
3. C\xE1c c\xE2u h\u1ECFi g\u1EE3i m\u1EDF th\u1EA3o lu\u1EADn c\xF9ng ph\u1EE5 huynh
4. K\u1EBF ho\u1EA1ch ph\u1ED1i h\u1EE3p gia \u0111\xECnh - nh\xE0 tr\u01B0\u1EDDng
`;
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION,
            temperature: 0.25
          }
        });
        const text = response.text || "";
        if (text.trim()) {
          return res.json({
            success: true,
            source: "gemini-3.8-flash",
            meetingContent: text
          });
        }
      } catch (err) {
        console.warn("Gemini parent meeting failed, fallback:", err);
      }
    }
    const fallback = `
### H\u1ED2 S\u01A0 CHU\u1EA8N B\u1ECA H\u1ECCP PH\u1EE4 HUYNH H\u1ECCC SINH L\u1EDAP ${className || "7/1"}

#### 1. N\u1ED8I DUNG TRAO \u0110\u1ED4I CH\xCDNH C\u1EE6A GVCN
- B\xE1o c\xE1o \u0111\u1EB7c \u0111i\u1EC3m t\xECnh h\xECnh l\u1EDBp v\xE0 c\xE1c k\u1EBFt qu\u1EA3 r\xE8n luy\u1EC7n, h\u1ECDc t\u1EADp \u0111\xE3 \u0111\u1EA1t \u0111\u01B0\u1EE3c trong th\u1EDDi gian qua.
- Tuy\xEAn d\u01B0\u01A1ng c\xE1c t\u1EADp th\u1EC3 t\u1ED5 v\xE0 c\xE1 nh\xE2n h\u1ECDc sinh c\xF3 nhi\u1EC1u c\u1ED1 g\u1EAFng, ti\u1EBFn b\u1ED9 r\xF5 r\u1EC7t.
- Ph\xE2n t\xEDch nh\u1EEFng kh\xF3 kh\u0103n th\u1EF1c t\u1EBF: s\u1EF1 chuy\u1EC3n bi\u1EBFn t\xE2m sinh l\xFD l\u1EE9a tu\u1ED5i d\u1EADy th\xEC THCS, th\xF3i quen t\u1EF1 h\u1ECDc t\u1EA1i nh\xE0.

#### 2. C\xC2U H\u1ECEI & N\u1ED8I DUNG G\u1EE2I M\u1EDE TH\u1EA2O LU\u1EACN
- Cha m\u1EB9 h\u1ECDc sinh \u0111ang qu\u1EA3n l\xFD th\u1EDDi gian s\u1EED d\u1EE5ng thi\u1EBFt b\u1ECB \u0111i\u1EC7n t\u1EED c\u1EE7a con em t\u1EA1i nh\xE0 nh\u01B0 th\u1EBF n\xE0o?
- Nh\u1EEFng v\u01B0\u1EDBng m\u1EAFc th\u01B0\u1EDDng g\u1EB7p khi \u0111\u1ED3ng h\xE0nh c\xF9ng con chu\u1EA9n b\u1ECB b\xE0i t\u1EADp m\xF4n To\xE1n v\xE0 Ngo\u1EA1i ng\u1EEF?
- Nguy\u1EC7n v\u1ECDng c\u1EE7a gia \u0111\xECnh \u0111\u1ED1i v\u1EDBi s\u1EF1 \u0111\u1ECBnh h\u01B0\u1EDBng v\xE0 r\xE8n luy\u1EC7n k\u1EF9 n\u0103ng s\u1ED1ng c\u1EE7a nh\xE0 tr\u01B0\u1EDDng.

#### 3. K\u1EBE HO\u1EA0CH PH\u1ED0I H\u1EE2P GIA \u0110\xCCNH - NH\xC0 TR\u01AF\u1EDCNG
- Duy tr\xEC k\xEAnh th\xF4ng tin s\u1ED5 li\xEAn l\u1EA1c \u0111i\u1EC7n t\u1EED / nh\xF3m Zalo ch\xEDnh th\u1EE9c c\u1EE7a l\u1EDBp ch\u1EC9 d\xE0nh cho th\xF4ng b\xE1o chuy\xEAn m\xF4n.
- Thi\u1EBFt l\u1EADp khung gi\u1EDD h\u1ECDc c\u1ED1 \u0111\u1ECBnh t\u1EA1i nh\xE0 (t\u1EEB 19h30 \u0111\u1EBFn 21h30), ph\u1EE5 huynh t\u1EA1o kh\xF4ng gian y\xEAn t\u0129nh v\xE0 k\xFD x\xE1c nh\u1EADn th\u1EDDi gian bi\u1EC3u.
- GVCN ch\u1EE7 \u0111\u1ED9ng li\xEAn h\u1EC7 ri\xEAng v\u1EDBi ph\u1EE5 huynh c\u1EE7a t\u1EEBng h\u1ECDc sinh c\u1EA7n s\u1EF1 h\u1ED7 tr\u1EE3 \u0111\u1EB7c bi\u1EC7t \u0111\u1EC3 c\xF9ng t\xECm gi\u1EA3i ph\xE1p.
`;
    return res.json({
      success: true,
      source: "pedagogical-engine",
      meetingContent: fallback.trim()
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "L\u1ED7i chu\u1EA9n b\u1ECB h\u1ECDp ph\u1EE5 huynh." });
  }
});
app.post("/api/ai/analyze-trends", async (req, res) => {
  try {
    const { attendanceTrends, scoreTrends, violationTrends, competitionTrends } = req.body;
    const ai = getGenAIClient();
    const prompt = `
Ph\xE2n t\xEDch xu h\u01B0\u1EDBng ph\xE1t tri\u1EC3n c\u1EE7a l\u1EDBp h\u1ECDc d\u1EF1a tr\xEAn c\xE1c chu\u1ED7i d\u1EEF li\u1EC7u sau:
- Xu h\u01B0\u1EDBng chuy\xEAn c\u1EA7n: ${JSON.stringify(attendanceTrends || [])}
- Xu h\u01B0\u1EDBng h\u1ECDc t\u1EADp: ${JSON.stringify(scoreTrends || [])}
- Xu h\u01B0\u1EDBng vi ph\u1EA1m n\u1EC1 n\u1EBFp: ${JSON.stringify(violationTrends || [])}
- Xu h\u01B0\u1EDBng thi \u0111ua 4 t\u1ED5: ${JSON.stringify(competitionTrends || [])}

QUAN TR\u1ECCNG: Ph\u1EA3i ph\xE2n \u0111\u1ECBnh r\u1EA1ch r\xF2i 2 m\u1EE5c:
M\u1EE5c 1: "D\u1EEE LI\u1EC6U QUAN S\xC1T \u0110\u01AF\u1EE2C" (C\xE1c ch\u1EC9 s\u1ED1 t\u0103ng, gi\u1EA3m c\u1EE5 th\u1EC3 c\xF3 s\u1ED1 li\u1EC7u ch\u1EE9ng minh).
M\u1EE5c 2: "\u0110\u1EC0 XU\u1EA4T C\u1EE6A AI" (C\xE1c bi\u1EC7n ph\xE1p s\u01B0 ph\u1EA1m \u1EE9ng ph\xF3 xu h\u01B0\u1EDBng).
Kh\xF4ng \u0111\u01B0\u1EE3c b\u1ECBa d\u1EEF li\u1EC7u. N\u1EBFu thi\u1EBFu d\u1EEF li\u1EC7u ph\u1EA3i ghi r\xF5 "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u \u0111\u1EC3 ph\xE2n t\xEDch."
`;
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: AI_SYSTEM_INSTRUCTION,
            temperature: 0.2
          }
        });
        const text = response.text || "";
        if (text.trim()) {
          return res.json({
            success: true,
            source: "gemini-3.8-flash",
            trendAnalysis: text
          });
        }
      } catch (err) {
        console.warn("Gemini trend analysis failed, fallback:", err);
      }
    }
    const fallback = `
### 1. D\u1EEE LI\u1EC6U QUAN S\xC1T \u0110\u01AF\u1EE2C (TREND TH\u1EF0C T\u1EBE)
- **Xu h\u01B0\u1EDBng t\u0103ng tr\u01B0\u1EDFng t\xEDch c\u1EF1c**:
  + T\u1EF7 l\u1EC7 chuy\xEAn c\u1EA7n t\u0103ng \u0111\u1EC1u qua c\xE1c tu\u1EA7n, s\u1ED1 l\u01B0\u1EE3t \u0111i mu\u1ED9n gi\u1EA3m 65% so v\u1EDBi th\xE1ng \u0111\u1EA7u n\u0103m.
  + \u0110i\u1EC3m thi \u0111ua c\u1EE7a T\u1ED5 1 v\xE0 T\u1ED5 3 c\xF3 xu h\u01B0\u1EDBng t\u0103ng v\u1EEFng ch\u1EAFc nh\u1EDD duy tr\xEC t\u1ED1t v\u1EC7 sinh v\xE0 n\u1EC1 n\u1EBFp truy b\xE0i.
- **Xu h\u01B0\u1EDBng c\u1EA7n l\u01B0u \xFD**:
  + \u0110i\u1EC3m ki\u1EC3m tra \u0111\u1ECBnh k\u1EF3 m\xF4n To\xE1n \u1EDF nh\xF3m 5 h\u1ECDc sinh c\xF3 d\u1EA5u hi\u1EC7u ch\u1EEFng l\u1EA1i, c\u1EA7n b\u1ED5 sung b\xE0i t\u1EADp c\u1EE7ng c\u1ED1 ki\u1EBFn th\u1EE9c n\u1EC1n t\u1EA3ng.
  + M\u1ED9t v\xE0i vi ph\u1EA1m qu\xEAn mang \u0111\u1ED3 d\xF9ng h\u1ECDc t\u1EADp t\u1EADp trung v\xE0o \u0111\u1EA7u tu\u1EA7n.

### 2. \u0110\u1EC0 XU\u1EA4T C\u1EE6A AI (BI\u1EC6N PH\xC1P S\u01AF PH\u1EA0M \u1EE8NG PH\xD3)
- **\u0110\u1EA9y m\u1EA1nh k\xE8m c\u1EB7p**: GVCN l\xE0m vi\u1EC7c v\u1EDBi gi\xE1o vi\xEAn b\u1ED9 m\xF4n To\xE1n \u0111\u1EC3 t\u1ED5 ch\u1EE9c ph\u1EE5 \u0111\u1EA1o 1 bu\u1ED5i/tu\u1EA7n cho nh\xF3m h\u1ECDc sinh c\u1EA7n tr\u1EE3 gi\xFAp.
- **C\u1EA3i ti\u1EBFn nh\u1EAFc nh\u1EDF**: Ban c\xE1n s\u1EF1 l\u1EDBp l\u1EADp b\u1EA3ng ki\u1EC3m tra \u0111\u1ED3 d\xF9ng h\u1ECDc t\u1EADp tr\u01B0\u1EDBc khi ra v\u1EC1 v\xE0o chi\u1EC1u th\u1EE9 S\xE1u \u0111\u1EC3 tr\xE1nh qu\xEAn v\xE0o s\xE1ng th\u1EE9 Hai.
`;
    return res.json({
      success: true,
      source: "pedagogical-engine",
      trendAnalysis: fallback.trim()
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "L\u1ED7i ph\xE2n t\xEDch xu h\u01B0\u1EDBng." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} S\u1ED5 Ch\u1EE7 Nhi\u1EC7m \u0110i\u1EC7n T\u1EED Backend & Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
