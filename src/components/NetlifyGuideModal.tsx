import React, { useState } from 'react';
import { Globe, X, Check, Copy, ExternalLink, Sparkles, Terminal, Github, FolderArchive, ArrowRight } from 'lucide-react';

interface NetlifyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetlifyGuideModal: React.FC<NetlifyGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'drop' | 'github' | 'cli'>('drop');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-cyan-200 p-6 sm:p-8 text-stone-850 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-stone-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-cyan-200">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              🚀 Netlify 一鍵上架部署指南
            </h3>
            <p className="text-stone-700 text-xs sm:text-sm mt-0.5">
              本專案已為你預先配置好所有 Netlify 必要檔案，輕鬆就能免費部署上線！
            </p>
          </div>
        </div>

        {/* Configuration Checklist */}
        <div className="bg-cyan-50/70 rounded-2xl p-4 border border-cyan-200/80 mb-6">
          <div className="text-xs font-bold text-cyan-900 mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>專案已自動內建以下 Netlify 設定：</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-cyan-800">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>內建 <code>netlify.toml</code> 自動構建配置</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>內建 <code>public/_redirects</code> 避免 404 錯誤</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>標準 Vite SPA 靜態建置輸出 (<code>dist/</code>)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>支援全端離線 LocalStorage 與 JSON 備份</span>
            </div>
          </div>
        </div>

        {/* Method Tabs */}
        <div className="flex items-center space-x-2 border-b border-stone-200 pb-2 mb-6">
          <button
            onClick={() => setActiveTab('drop')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'drop'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>方式 1：Netlify Drop 拖曳上架（免指令最快）</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'github'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>方式 2：GitHub 連動（推薦）</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'cli'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>方式 3：CLI 指令</span>
          </button>
        </div>

        {/* Tab 1: Netlify Drop */}
        {activeTab === 'drop' && (
          <div className="space-y-4 text-sm text-stone-700">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              💡 <strong>最適合不需要寫程式的人</strong>：只要打包後把產生的 <code>dist</code> 資料夾拖進 Netlify 網頁，10 秒內就能得到專屬網址！
            </div>

            <ol className="space-y-3 list-decimal list-inside text-xs sm:text-sm text-stone-700">
              <li className="leading-relaxed">
                在終端機或匯出專案中執行打包指令：
                <div className="mt-1.5 flex items-center justify-between bg-stone-900 text-stone-100 px-3 py-2 rounded-xl font-mono text-xs">
                  <span>npm run build</span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'build-cmd')}
                    className="p-1 text-stone-400 hover:text-white"
                  >
                    {copiedCode === 'build-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>
              <li className="leading-relaxed">
                打包完成後，專案中會生成一個 <strong><code>dist</code></strong> 資料夾。
              </li>
              <li className="leading-relaxed">
                打開瀏覽器前往 Netlify Drop 頁面：
                <a
                  href="https://app.netlify.com/drop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-cyan-600 hover:underline font-semibold ml-1"
                >
                  <span>app.netlify.com/drop</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li className="leading-relaxed">
                將整個 <strong><code>dist</code></strong> 資料夾直接拖曳進網頁中央的虛線框框。
              </li>
              <li className="leading-relaxed">
                🎉 大功告成！Netlify 會立即提供一個免費公開網址（例如 <code>https://lovely-trip-1234.netlify.app</code>），你可以進入 <strong>Site configuration</strong> 修改成好記的名字（例如 <code>peggy-birthday-trip.netlify.app</code>）！
              </li>
            </ol>
          </div>
        )}

        {/* Tab 2: GitHub Integration */}
        {activeTab === 'github' && (
          <div className="space-y-4 text-sm text-stone-700">
            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 leading-relaxed">
              ⭐ <strong>最推薦方式</strong>：連動 GitHub 後，每次你更新行程或文字，推送（Push）程式碼後 Netlify 就會自動更新部署！
            </div>

            <ol className="space-y-3 list-decimal list-inside text-xs sm:text-sm text-stone-700">
              <li className="leading-relaxed">
                將此專案發布或推送到你的 <strong>GitHub Repository</strong>。
              </li>
              <li className="leading-relaxed">
                登入 <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline font-semibold">Netlify</a>，點選 <strong>"Add new site" ➔ "Import an existing project"</strong>。
              </li>
              <li className="leading-relaxed">
                選擇 <strong>GitHub</strong> 並授權選取你的生日旅行專案 Repo。
              </li>
              <li className="leading-relaxed">
                確認 Build 設定（因為有 <code>netlify.toml</code>，Netlify 通常會自動偵測填好）：
                <div className="mt-2 bg-stone-900 text-stone-100 p-3 rounded-xl font-mono text-xs space-y-1">
                  <div>Build command: <span className="text-amber-400">npm run build</span></div>
                  <div>Publish directory: <span className="text-cyan-400">dist</span></div>
                </div>
              </li>
              <li className="leading-relaxed">
                點擊 <strong>"Deploy site"</strong>，約 30 秒即自動構建上線！
              </li>
            </ol>
          </div>
        )}

        {/* Tab 3: CLI */}
        {activeTab === 'cli' && (
          <div className="space-y-4 text-sm text-stone-700">
            <p className="text-xs text-stone-600 leading-relaxed">
              如果你習慣使用指令列終端機，可透過 Netlify 官方 CLI 進行快速部署：
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-stone-500 font-sans text-[11px] mb-1">1. 安裝 Netlify CLI 工具</div>
                <div className="flex items-center justify-between bg-stone-900 text-stone-100 p-2.5 rounded-xl">
                  <span>npm install -g netlify-cli</span>
                  <button
                    onClick={() => copyToClipboard('npm install -g netlify-cli', 'cli-1')}
                    className="p-1 text-stone-400 hover:text-white"
                  >
                    {copiedCode === 'cli-1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-stone-500 font-sans text-[11px] mb-1">2. 打包專案</div>
                <div className="flex items-center justify-between bg-stone-900 text-stone-100 p-2.5 rounded-xl">
                  <span>npm run build</span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'cli-2')}
                    className="p-1 text-stone-400 hover:text-white"
                  >
                    {copiedCode === 'cli-2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-stone-500 font-sans text-[11px] mb-1">3. 部署至正式環境</div>
                <div className="flex items-center justify-between bg-stone-900 text-stone-100 p-2.5 rounded-xl">
                  <span>netlify deploy --prod --dir=dist</span>
                  <button
                    onClick={() => copyToClipboard('netlify deploy --prod --dir=dist', 'cli-3')}
                    className="p-1 text-stone-400 hover:text-white"
                  >
                    {copiedCode === 'cli-3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-700">
            💖 部署完成後，只要把 Netlify 產生的專屬網址傳到女友 Line/IG，她就能在手機上完整查看囉！
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            我知道了
          </button>
        </div>

      </div>
    </div>
  );
};
