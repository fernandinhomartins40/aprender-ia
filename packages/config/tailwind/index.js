/** Preset Tailwind — Aprender IA */
module.exports = {
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: "#4F46E5", dark: "#4338CA", soft: "#EEF0FE", line: "#DDE1FB" },
        laranja: { DEFAULT: "#F97316", dark: "#C2410C", soft: "#FFF3E8" },
        verde: { DEFAULT: "#10B981", dark: "#047857", soft: "#ECFDF5" },
        vermelho: { DEFAULT: "#EF4444", dark: "#B91C1C", soft: "#FEF2F2" },
        amarelo: { DEFAULT: "#EAB308", dark: "#A16207", soft: "#FEFCE8" },
        enc: {
          1: "#6366F1", "1-soft": "#EEF2FF",
          2: "#0EA5E9", "2-soft": "#E0F2FE",
          3: "#10B981", "3-soft": "#ECFDF5",
          4: "#F59E0B", "4-soft": "#FEF3C7",
        },
        xp: "#F97316",
        streak: "#EF4444",
        conquista: "#EAB308",
        bloqueado: "#94A3B8",
        tinta: { DEFAULT: "#1E293B", clara: "#475569" },
        cinza: { DEFAULT: "#64748B", claro: "#94A3B8" },
        azul: { DEFAULT: "#2563EB", soft: "#EFF6FF" },
        borda: "#E2E8F0",
        fundo: "#FCFCFE",
        superficie: "#FFFFFF",
        prompt: { bg: "#151F38", bg2: "#1B2745", txt: "#E8EDF7" },
      },
      fontFamily: {
        titulo: ["Montserrat", "system-ui", "sans-serif"],
        corpo: ["Nunito Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "24px", full: "999px" },
      boxShadow: {
        sm: "0 1px 3px rgba(15,23,42,.06)",
        md: "0 5px 18px rgba(15,23,42,.05)",
        lg: "0 12px 32px rgba(15,23,42,.09)",
        cor: "0 8px 24px rgba(79,70,229,.22)",
      },
      backgroundImage: {
        "grad-marca": "linear-gradient(135deg,#4F46E5 0%,#6366F1 50%,#818CF8 100%)",
        "grad-energia": "linear-gradient(135deg,#F97316 0%,#FB923C 100%)",
        "grad-sucesso": "linear-gradient(135deg,#10B981 0%,#34D399 100%)",
        "grad-capa": "linear-gradient(150deg,#EEF0FE 0%,#F6F4FF 45%,#FFF8F0 100%)",
        // Faixa escura da landing ("Muito mais que cursos"). O texto sobre
        // ela é branco, então os dois extremos são escuros o bastante.
        "grad-escuro": "linear-gradient(120deg,#1E1B4B 0%,#312E81 55%,#4C1D95 100%)",
        // Chamada final: azul → roxo, com o mascote sobreposto.
        "grad-chamada": "linear-gradient(110deg,#2563EB 0%,#4F46E5 45%,#7C3AED 100%)",
      },
      keyframes: {
        pulsar: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.05)" } },
        subir: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        brilho: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".6" } },
      },
      animation: {
        pulsar: "pulsar 2s ease-in-out infinite",
        subir: "subir 250ms ease-out",
        brilho: "brilho 1.5s ease-in-out infinite",
      },
    },
  },
};
