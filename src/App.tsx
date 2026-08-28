import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroCountdown } from './components/HeroCountdown';
import { ItineraryView } from './components/ItineraryView';
import { SurprisePlanner } from './components/SurprisePlanner';
import { DiningTracker } from './components/DiningTracker';
import { PackingChecklist } from './components/PackingChecklist';
import { BudgetTracker } from './components/BudgetTracker';
import { PhotoBoard } from './components/PhotoBoard';
import { LoveLetterModal } from './components/LoveLetterModal';
import { TripSettingsModal } from './components/TripSettingsModal';
import { NetlifyGuideModal } from './components/NetlifyGuideModal';
import { PrintGuideModal } from './components/PrintGuideModal';
import { SurpriseRevealModal } from './components/SurpriseRevealModal';
import { SnackWishlistView } from './components/SnackWishlistView';
import { LiveAlertModal, ALERT_SCENARIOS, LiveAlertScenario } from './components/LiveAlertModal';
import { RoleAndSimulatorBar } from './components/RoleAndSimulatorBar';
import { FirebaseDataInspectorModal } from './components/FirebaseDataInspectorModal';
import { GuestGatekeeper } from './components/GuestGatekeeper';
import { useAuth } from './context/AuthContext';
import { BirthdayTripData } from './types';
import { loadTripData, saveTripData, syncTripToCloud, subscribeToTripFromCloud } from './utils/storage';
import { Heart, Sparkles, Globe, Gift, Bell, UtensilsCrossed, Stethoscope, Cake, Flame, Play, Star, Lock } from 'lucide-react';

export default function App() {
  const { isBoyfriend, isAuthorizedEditor, isGuest } = useAuth();
  const [tripData, setTripData] = useState<BirthdayTripData>(() => loadTripData());
  const [activeTab, setActiveTab] = useState<string>('itinerary');

  // Modals state
  const [isLoveLetterOpen, setIsLoveLetterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNetlifyGuideOpen, setIsNetlifyGuideOpen] = useState(false);
  const [isPrintGuideOpen, setIsPrintGuideOpen] = useState(false);
  const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);

  // Live Alerts state
  const [activeScenario, setActiveScenario] = useState<LiveAlertScenario | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);
  const [sentAlertId, setSentAlertId] = useState<string | null>(null);
  const [sentToast, setSentToast] = useState<string | null>(null);

  // 1. Subscribe to Real-time Cloud updates (so girlfriend & boyfriend sync instantly)
  useEffect(() => {
    const unsubscribe = subscribeToTripFromCloud((cloudData) => {
      if (cloudData && cloudData.settings) {
        setTripData(cloudData);
        saveTripData(cloudData);

        // If cloud data has an activeLiveAlert that is new, show modal for girlfriend
        if (cloudData.activeLiveAlert && cloudData.activeLiveAlert.id) {
          const scenarioMatch: LiveAlertScenario = {
            id: cloudData.activeLiveAlert.scenarioId || cloudData.activeLiveAlert.id,
            triggerTime: cloudData.activeLiveAlert.timeLabel,
            timeLabel: cloudData.activeLiveAlert.timeLabel,
            title: cloudData.activeLiveAlert.title,
            message: cloudData.activeLiveAlert.message,
            secondaryHint: cloudData.activeLiveAlert.secondaryHint,
            category: cloudData.activeLiveAlert.category,
            badge: cloudData.activeLiveAlert.badge
          };
          setActiveScenario(scenarioMatch);
          setIsAlertModalOpen(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto-save locally whenever tripData changes
  useEffect(() => {
    saveTripData(tripData);
  }, [tripData]);

  const handleTriggerScenario = (scenario: LiveAlertScenario) => {
    // 1. Set active scenario for local modal preview
    setActiveScenario(scenario);
    setIsAlertModalOpen(true);
    setShowScenarioPicker(false);

    // 2. Visual feedback "已發送"
    setSentAlertId(scenario.id);
    setSentToast(`✨ 已成功發送「${scenario.title}」至女友視角！`);
    setTimeout(() => {
      setSentAlertId(null);
      setSentToast(null);
    }, 4000);

    // 3. Sync to tripData.activeLiveAlert so it persists and syncs to girlfriend view
    setTripData(prev => {
      const updated: BirthdayTripData = {
        ...prev,
        activeLiveAlert: {
          id: 'alert-' + Date.now(),
          scenarioId: scenario.id,
          title: scenario.title,
          message: scenario.message,
          secondaryHint: scenario.secondaryHint,
          timeLabel: scenario.timeLabel,
          badge: scenario.badge,
          category: scenario.category,
          sentAt: new Date().toISOString()
        }
      };
      syncTripToCloud(updated);
      return updated;
    });
  };

  // Sync Secret Itinerary with Surprises List
  const handleSyncSecretSurprise = (activity: ActivityItem, dayNumber: number, isDeleted: boolean = false) => {
    setTripData(prev => {
      let updatedSurprises = [...prev.surprises];
      const existingIndex = updatedSurprises.findIndex(s => s.activityId === activity.id);

      if (isDeleted || !activity.isSecretSurprise) {
        // If deleted or unchecked secret, remove from surprise list if linked
        if (existingIndex !== -1) {
          updatedSurprises = updatedSurprises.filter(s => s.activityId !== activity.id);
        }
      } else if (activity.isSecretSurprise) {
        // Map category
        let surpriseCat: 'gift' | 'cake' | 'activity' | 'memory' | 'letter' = 'activity';
        if (activity.category === 'dining') surpriseCat = 'cake';
        else if (activity.category === 'nightlife') surpriseCat = 'activity';
        else if (activity.category === 'sightseeing') surpriseCat = 'memory';

        const surpriseEntry: SurpriseItem = {
          id: existingIndex !== -1 ? updatedSurprises[existingIndex].id : 'surp-act-' + activity.id,
          title: activity.title,
          timing: `Day ${dayNumber} ${activity.time}`,
          location: activity.location || '台南神秘地點',
          description: activity.description || '由蔡寶為晴寶秘密安排的專屬浪漫行程！',
          isUnlocked: false,
          unlockCode: '0520',
          hint: activity.surpriseHint || '秘密行程，等妳親自揭曉 💕',
          category: surpriseCat,
          activityId: activity.id,
          dayNumber
        };

        if (existingIndex !== -1) {
          updatedSurprises[existingIndex] = surpriseEntry;
        } else {
          updatedSurprises.push(surpriseEntry);
        }
      }

      const updated = { ...prev, surprises: updatedSurprises };
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateTripData = (newData: BirthdayTripData) => {
    setTripData(newData);
    syncTripToCloud(newData);
  };

  const handleUpdateItinerary = (newItinerary: BirthdayTripData['itinerary']) => {
    setTripData(prev => {
      const updated = { ...prev, itinerary: newItinerary };
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateSurprises = (newSurprises: BirthdayTripData['surprises']) => {
    setTripData(prev => {
      const updated = { ...prev, surprises: newSurprises };
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateDining = (newDining: BirthdayTripData['dining']) => {
    setTripData(prev => {
      const updated = { ...prev, dining: newDining };
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdatePacking = (newPacking: BirthdayTripData['packingList']) => {
    setTripData(prev => {
      const updated = { ...prev, packingList: newPacking };
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateExpenses = (newExpenses: BirthdayTripData['expenses']) => {
    setTripData(prev => {
      const updated = { ...prev, expenses: newExpenses };
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdatePhotos = (newPhotos: BirthdayTripData['photos']) => {
    setTripData(prev => {
      const updated = { ...prev, photos: newPhotos };
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateLoveLetter = (newLetter: BirthdayTripData['loveLetter']) => {
    setTripData(prev => {
      const updated = { ...prev, loveLetter: newLetter };
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateSettings = (newSettings: BirthdayTripData['settings']) => {
    setTripData(prev => {
      const updated = { ...prev, settings: newSettings };
      syncTripToCloud(updated);
      return updated;
    });
  };

  // 3. Strict Gatekeeper: Block all views, tabs, surprises, and contents for unauthenticated guests
  if (isGuest || !isAuthorizedEditor) {
    return <GuestGatekeeper tripData={tripData} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D241E] flex flex-col selection:bg-[#EBDDCF] selection:text-[#4A3B32]">
      
      {/* Top Role and Time Lock Simulator Bar */}
      <RoleAndSimulatorBar
        boyfriendName={tripData.settings.boyfriendName || '蔡寶'}
        girlfriendName={tripData.settings.girlfriendName || '晴寶'}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDbInspector={() => setIsDbInspectorOpen(true)}
      />

      {/* Top Sticky Navigation Header */}
      <Header
        tripData={tripData}
        onUpdateTripData={handleUpdateTripData}
        onOpenLoveLetter={() => setIsLoveLetterOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNetlifyGuide={() => setIsNetlifyGuideOpen(true)}
        onOpenPrintGuide={() => setIsPrintGuideOpen(true)}
        onTriggerSurpriseModal={() => setIsSurpriseModalOpen(true)}
        onOpenLiveAlerts={() => setShowScenarioPicker(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Live Interactive Notification Banner (Only visible to Boyfriend for rehearsal/triggering) */}
        {isBoyfriend && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 border border-amber-200/80 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs sm:text-sm text-stone-900">
                    🔔 專屬行程情境即時通知系統
                  </span>
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
                    10/16 18:00 ＆ 23:00
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  包含 18:00 晚餐提醒 ＆ 23:00 洗完澡「密醫看診時間」互動情境（僅蔡寶可見此模擬面板）
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleTriggerScenario(ALERT_SCENARIOS[0])}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap ${
                  sentAlertId === ALERT_SCENARIOS[0].id
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {sentAlertId === ALERT_SCENARIOS[0].id ? (
                  <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                ) : (
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                )}
                <span>{sentAlertId === ALERT_SCENARIOS[0].id ? '已發送至女友視角！' : '18:00 晚餐通知'}</span>
              </button>

              <button
                onClick={() => handleTriggerScenario(ALERT_SCENARIOS[1])}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap ${
                  sentAlertId === ALERT_SCENARIOS[1].id
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-white hover:bg-pink-50 text-pink-700 border-pink-200'
                }`}
              >
                {sentAlertId === ALERT_SCENARIOS[1].id ? (
                  <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                ) : (
                  <Stethoscope className="w-3.5 h-3.5 text-pink-500" />
                )}
                <span>{sentAlertId === ALERT_SCENARIOS[1].id ? '已發送至女友視角！' : '23:00 密醫看診 🩺'}</span>
              </button>

              <button
                onClick={() => setShowScenarioPicker(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>全部通知模擬</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Floating Toast for Trigger Confirmation */}
        {sentToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900/90 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center space-x-2.5 animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">{sentToast}</span>
          </div>
        )}

        {/* Romantic Hero & Countdown Banner */}
        <HeroCountdown
          settings={tripData.settings}
          onOpenLoveLetter={() => setIsLoveLetterOpen(true)}
          onTriggerSurpriseModal={() => setIsSurpriseModalOpen(true)}
        />

        {/* Tab Views */}
        <div className="transition-all duration-300">
          {activeTab === 'itinerary' && (
            <ItineraryView
              itinerary={tripData.itinerary}
              onUpdateItinerary={handleUpdateItinerary}
              secretModePassword={tripData.settings.secretModePassword}
              onSyncSecretSurprise={handleSyncSecretSurprise}
            />
          )}

          {activeTab === 'snacks' && (
            <SnackWishlistView
              girlfriendName={tripData.settings.girlfriendName || '晴寶'}
              boyfriendName={tripData.settings.boyfriendName || '蔡寶'}
            />
          )}

          {activeTab === 'surprises' && (
            <SurprisePlanner
              surprises={tripData.surprises}
              onUpdateSurprises={handleUpdateSurprises}
              secretModePassword={tripData.settings.secretModePassword}
            />
          )}

          {activeTab === 'dining' && (
            isBoyfriend ? (
              <DiningTracker
                diningList={tripData.dining}
                onUpdateDining={handleUpdateDining}
              />
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  🔒 專屬神秘訂位資訊封存中
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  這部分包含蔡寶為妳秘密安排的美味慶生饗宴，將在用餐前依時程逐一揭曉！
                </p>
              </div>
            )
          )}

          {activeTab === 'packing' && (
            <PackingChecklist
              packingList={tripData.packingList}
              onUpdatePacking={handleUpdatePacking}
            />
          )}

          {activeTab === 'budget' && (
            isBoyfriend ? (
              <BudgetTracker
                expenses={tripData.expenses}
                onUpdateExpenses={handleUpdateExpenses}
              />
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 fill-rose-500 text-rose-500" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  👑 晴寶只需盡情享受旅程！
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  本次旅程所有花費與預算由蔡寶全額策劃打理，晴寶只要帶著最開心的笑容一起出發即可～
                </p>
              </div>
            )
          )}

          {activeTab === 'photos' && (
            <PhotoBoard
              photos={tripData.photos}
              onUpdatePhotos={handleUpdatePhotos}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-rose-100/80 bg-white/70 backdrop-blur-xs py-8 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-1.5 font-serif text-rose-600 font-medium">
            <span>Made with deep love by {tripData.settings.boyfriendName || '蔡寶'}</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
            <span>For {tripData.settings.girlfriendName || '晴寶'} Birthday Trip</span>
          </div>

          <p className="text-stone-400">
            台南 Tainan · {tripData.settings.startDate} ~ {tripData.settings.endDate} · ⭐ 晴寶 10/17 生日快樂！
          </p>

          <div className="pt-2 flex items-center justify-center space-x-3 text-stone-400">
            <button
              onClick={() => setIsNetlifyGuideOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-cyan-700 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Netlify 上架部署指南</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsPrintGuideOpen(true)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              列印手冊 (PDF)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              修改旅行設定
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoveLetterModal
        isOpen={isLoveLetterOpen}
        onClose={() => setIsLoveLetterOpen(false)}
        loveLetter={tripData.loveLetter}
        onUpdateLoveLetter={handleUpdateLoveLetter}
      />

      <TripSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={tripData.settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <NetlifyGuideModal
        isOpen={isNetlifyGuideOpen}
        onClose={() => setIsNetlifyGuideOpen(false)}
      />

      <PrintGuideModal
        isOpen={isPrintGuideOpen}
        onClose={() => setIsPrintGuideOpen(false)}
        tripData={tripData}
      />

      <SurpriseRevealModal
        isOpen={isSurpriseModalOpen}
        onClose={() => setIsSurpriseModalOpen(false)}
        loveLetter={tripData.loveLetter}
        settings={tripData.settings}
        onExploreItinerary={() => {
          setActiveTab('itinerary');
        }}
      />

      <FirebaseDataInspectorModal
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
        tripData={tripData}
        onTripDataUpdated={handleUpdateTripData}
      />

      {/* Live Alert Modal */}
      <LiveAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        scenario={activeScenario}
        girlfriendName={tripData.settings.girlfriendName || '晴寶'}
        boyfriendName={tripData.settings.boyfriendName || '蔡寶'}
      />

      {/* All Scenarios Picker Modal */}
      {showScenarioPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-amber-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>專屬行程互動即時情境通知模擬</span>
              </h3>
              <button
                onClick={() => setShowScenarioPicker(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500 mt-2">
              點擊任一情境立即體驗即時通知彈窗、提示音效與浪漫動畫：
            </p>

            <div className="mt-4 space-y-3">
              {ALERT_SCENARIOS.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => handleTriggerScenario(sc)}
                  className="p-4 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {sc.timeLabel}
                      </span>
                      <span className="text-xs text-stone-400">{sc.badge}</span>
                    </div>
                    <div className="text-sm font-bold text-stone-900 group-hover:text-amber-700">
                      {sc.title}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-amber-500 group-hover:text-white text-stone-400 flex items-center justify-center transition-all shrink-0 ml-2">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
