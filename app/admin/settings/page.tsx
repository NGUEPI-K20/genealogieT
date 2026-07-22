export default function SettingsPage() {
  return (
    <div className="grid grid-cols-[1fr_280px] gap-6 max-w-[960px]">
      <div>
        <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#2E2B25] flex items-center gap-2 font-playfair text-[0.88rem] text-[#E8E0D0]">
            <span className="text-[#C8922A] text-[0.8rem]">⚙</span> Configuration
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">Nom de la famille</label>
              <input defaultValue="Nguepi" className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420]" />
            </div>
            <div>
              <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">Sous-titre</label>
              <input defaultValue="Arbre Généalogique" className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">URL Supabase</label>
                <input placeholder="https://xxx.supabase.co" className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420] placeholder:text-[#4A4640]" />
              </div>
              <div>
                <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">Clé publique</label>
                <input type="password" placeholder="eyJh…" className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420] placeholder:text-[#4A4640]" />
              </div>
            </div>
            <button className="bg-[#C8922A] text-[#0E0D0B] px-4 py-2 font-playfair text-[0.8rem] rounded-[3px] hover:bg-[#D9A040] transition-colors mt-2">
              ✓ Sauvegarder
            </button>
          </div>
        </div>
      </div>
      <div>
        <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#2E2B25] flex items-center gap-2 font-playfair text-[0.88rem] text-[#E8E0D0]">
            <span className="text-[#C8922A] text-[0.8rem]">◈</span> Compte admin
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">Email</label>
              <input type="email" defaultValue="admin@nguepi.fr" className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420]" />
            </div>
            <div>
              <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">Nouveau mot de passe</label>
              <input type="password" placeholder="••••••••" className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420] placeholder:text-[#4A4640]" />
            </div>
            <button className="bg-[#1E1C18] border border-[#2E2B25] text-[#7A7268] px-3.5 py-2 font-mono text-[0.72rem] rounded-[3px] hover:border-[#3A3630] hover:text-[#E8E0D0] transition-all">
              Mettre à jour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
