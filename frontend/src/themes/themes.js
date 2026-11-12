export const themes = {

  cyberpunk: {

    background:
      'bg-black bg-[radial-gradient(circle_at_top,#0f172a_0%,#020617_50%,#000000_100%)]',

    overlay:
      'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_70%)]',

    panel:
      'bg-slate-900/40 backdrop-blur-2xl',

    border:
      'border-cyan-500/30',

    glow:
      'shadow-[0_0_40px_rgba(34,211,238,0.12)]',

    text:
      'text-cyan-300',

    accent:
      'text-cyan-400',

    button:
      'bg-cyan-500 text-black'

  },

  matrix: {

    background:
      'bg-black bg-[radial-gradient(circle_at_top,#001100_0%,#000000_70%)]',

    overlay:
      'before:absolute before:inset-0 before:bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px)] before:bg-[size:100%_4px]',

    panel:
      'bg-[#031006]/70 backdrop-blur-xl',

    border:
      'border-green-500/20',

    glow:
      'shadow-[0_0_30px_rgba(34,197,94,0.10)]',

    text:
      'text-green-300',

    accent:
      'text-green-400',

    button:
      'bg-green-500 text-black'

  },

  midnight: {

    background:
      'bg-[#020617] bg-[radial-gradient(circle_at_top,#1e293b_0%,#020617_70%)]',

    overlay:
      'before:absolute before:inset-0 before:bg-gradient-to-b before:from-slate-800/10 before:to-transparent',

    panel:
      'bg-slate-900/60 backdrop-blur-xl',

    border:
      'border-slate-500/20',

    glow:
      'shadow-[0_0_30px_rgba(148,163,184,0.08)]',

    text:
      'text-white',

    accent:
      'text-slate-300',

    button:
      'bg-slate-300 text-black'

  },

  frost: {

    background:
      'bg-[#09131f] bg-[radial-gradient(circle_at_top,#164e63_0%,#020617_80%)]',

    overlay:
      'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.08),transparent_70%)]',

    panel:
      'bg-cyan-950/20 backdrop-blur-3xl',

    border:
      'border-cyan-200/20',

    glow:
      'shadow-[0_0_40px_rgba(125,211,252,0.10)]',

    text:
      'text-cyan-100',

    accent:
      'text-cyan-300',

    button:
      'bg-cyan-200 text-black'

  }

}
