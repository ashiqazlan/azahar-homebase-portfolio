export default function ThemeSelector({
  currentTheme,
  setCurrentTheme
}) {

  const themes = [
    'cyberpunk',
    'matrix',
    'midnight',
    'frost'
  ]

  return (
    <select
      value={currentTheme}
      onChange={(e) => setCurrentTheme(e.target.value)}
      className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white"
    >

      {themes.map(theme => (
        <option key={theme} value={theme}>
          {theme}
        </option>
      ))}

    </select>
  )
}
