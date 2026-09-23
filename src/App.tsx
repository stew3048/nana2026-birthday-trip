import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroCountdown } from './components/HeroCountdown';
import { HomeView } from './components/HomeView';
import { AddEditAlertCardModal } from './components/AddEditAlertCardModal';
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
import { LiveAlertModal, LiveAlertScenario } from './components/LiveAlertModal';
import { RoleAndSimulatorBar } from './components/RoleAndSimulatorBar';
import { FirebaseDataInspectorModal } from './components/FirebaseDataInspectorModal';
import { GuestGatekeeper } from './components/GuestGatekeeper';
import { ThemeStudioView } from './components/ThemeStudioView';
import { useAuth } from './context/AuthContext';
import { BirthdayTripData, ActivityItem, SurpriseItem, DayHighlightCard } from './types';
import { loadTripData, saveTripData, syncTripToCloud, subscribeToTripFromCloud, fetchTripFromCloud } from './utils/storage';
import { TIME_SIMULATOR_PRESETS, sortSurprisesByStartTime, sortScenariosByStartTime, extractScenarioDateTimeComponents, extractTimestampFromTiming } from './utils/timeLock';
import { updateConsolidatedSurprises, getConsolidatedSurprises } from './utils/surpriseSync';
import { getSynchronizedAlertScenarios } from './utils/alertScenariosSync';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Gift, Bell, UtensilsCrossed, Stethoscope, Cake, Flame, Play, Star, Lock, CheckCircle2, RotateCcw, Plus, Edit3, Trash2, Eye, Clock } from 'lucide-react';

export default function App() {
  const { isBoyfriend, isGirlfriend, isAuthorizedEditor, isGuest, effectiveTime, simulatedTime, setSimulatedTime } = useAuth();
  const [tripData, setTripData] = useState<BirthdayTripData>(() => loadTripData());
  const [activeTab, setActiveTab] = useState<string>('home');

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
  const [isAddEditAlertOpen, setIsAddEditAlertOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<LiveAlertScenario | null>(null);
  const [scenarioToDelete, setScenarioToDelete] = useState<LiveAlertScenario | null>(null);
  const [sentAlertId, setSentAlertId] = useState<string | null>(null);
  const [sentToast, setSentToast] = useState<string | null>(null);

  // Helper to check if a scenario trigger time is reached by effectiveTime
  const isScenarioDue = (scenario: LiveAlertScenario, currentTime: Date, _isSimulating: boolean): boolean => {
    try {
      const parts = scenario.triggerTime.trim().split(' ');
      if (parts.length === 2) {
        const [datePart, timePart] = parts;
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        const trigDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        
        const diffMs = currentTime.getTime() - trigDate.getTime();
        return diffMs >= 0;
      }
    } catch (e) {}
    return false;
  };

  // Track dismissed alerts in reactive state so UI immediately updates
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('qingbao_dismissed_alerts');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch (e) {
      return new Set();
    }
  });

  const markAlertDismissed = (alertId: string) => {
    setDismissedAlertIds(prev => {
      const next = new Set(prev);
      next.add(alertId);
      try {
        sessionStorage.setItem('qingbao_dismissed_alerts', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  // Dynamically synchronize all Live Alert Scenarios directly from the active consolidated surprises!
  // Whenever an itinerary activity becomes/cancels as a secret surprise, or a surprise is added/edited/deleted,
  // the alert scenarios adjust reactively without any hardcoded preset dependencies.
  const allScenarios: LiveAlertScenario[] = useMemo(() => {
    return getSynchronizedAlertScenarios(tripData);
  }, [
    tripData.surprises,
    tripData.itinerary,
    tripData.standaloneSurprises,
    tripData.customAlertScenarios,
    tripData.settings.hiddenScenarioIds
  ]);

  // Surprise items sorted by start time (strictly consolidated from itinerary secrets + standalone surprises)
  const sortedSurprises = useMemo(() => {
    return getConsolidatedSurprises(tripData);
  }, [tripData.surprises, tripData.itinerary, tripData.standaloneSurprises]);

  // All scenarios currently due up to effectiveTime (for automatic background scheduling)
  const allDueScenarios = allScenarios.filter(s => 
    isScenarioDue(s, effectiveTime, Boolean(simulatedTime))
  );

  // Only unread scenarios that have arrived by effectiveTime
  const unreadDueScenarios = allDueScenarios.filter(s => !dismissedAlertIds.has(s.id));

  // Refs to track whether a scenario or cloud alert has already been auto-popped up
  // to avoid re-opening repeatedly when the user clicks 'X' (leaving it in unread queue)
  const lastAutoPoppedScenarioIdRef = useRef<string | null>(null);
  const lastAutoPoppedAlertIdRef = useRef<string | null>(null);

  // Reset confetti on mount in case of any lingering ribbon canvas & clear any stale active alerts & sync surprises
  useEffect(() => {
    try {
      confetti.reset();
    } catch (e) {}

    // Comprehensive data sanitation to prevent stale/misaligned surprises
    setTripData(prev => {
      let changed = false;
      let newActiveLiveAlert = prev.activeLiveAlert;

      // 1. Clean up stale or unwanted active live alerts (e.g., '請半天假' or '燒肉' or 00:00 midnight alert)
      if (newActiveLiveAlert) {
        const title = newActiveLiveAlert.title || '';
        const sentTime = newActiveLiveAlert.sentAt ? new Date(newActiveLiveAlert.sentAt).getTime() : 0;
        const isStale = !sentTime || (Date.now() - sentTime > 20 * 60 * 1000);
        const isUnwanted = title.includes('請半天假') || title.includes('私心燒肉') || title.includes('壽星跨日整點') || newActiveLiveAlert.id === 'alert-1017-birthday';
        if (isStale || isUnwanted) {
          newActiveLiveAlert = undefined;
          changed = true;
        }
      }

      // 2. Filter out any '請半天假' or unwanted alerts from customAlertScenarios
      let newCustomAlerts = prev.customAlertScenarios || [];
      if (newCustomAlerts.some(s => s.title && (s.title.includes('請半天假') || s.title.includes('私心燒肉') || s.title.includes('壽星跨日整點')))) {
        newCustomAlerts = newCustomAlerts.filter(s => !s.title.includes('請半天假') && !s.title.includes('私心燒肉') && !s.title.includes('壽星跨日整點'));
        changed = true;
      }

      // 3. Ensure act-1-5 (三溫暖水療) is marked isSecretSurprise in itinerary
      let newItinerary = prev.itinerary;
      if (Array.isArray(newItinerary)) {
        newItinerary = newItinerary.map(day => {
          if (day.dayNumber === 1 && Array.isArray(day.activities)) {
            const hasSpa = day.activities.some(a => a.id === 'act-1-5');
            if (hasSpa) {
              const updatedActivities = day.activities.map(a => {
                if (a.id === 'act-1-5' && !a.isSecretSurprise) {
                  changed = true;
                  return { ...a, isSecretSurprise: true, surpriseHint: '晚上 20:30 煙波男女三溫暖水療放鬆泡湯 🧖‍♀️' };
                }
                return a;
              });
              return { ...day, activities: updatedActivities };
            }
          }
          return day;
        });
      }

      // 4. Sanitize surprises list (remove '請半天假', '燒肉', and midnight '跨日整點' surprise)
      let updatedSurprises = [...(prev.surprises || [])];
      
      if (updatedSurprises.some(s => s.title.includes('請半天假') || s.title.includes('私心敲碗') || s.id === 'surp-6' || s.id === 'surp-3' || s.title.includes('壽星跨日整點'))) {
        updatedSurprises = updatedSurprises.filter(s => !s.title.includes('請半天假') && !s.title.includes('私心敲碗') && s.id !== 'surp-6' && s.id !== 'surp-3' && !s.title.includes('壽星跨日整點'));
        changed = true;
      }

      // Ensure surp-spa exists
      if (!updatedSurprises.some(s => s.id === 'surp-spa' || s.activityId === 'act-1-5')) {
        updatedSurprises.push({
          id: 'surp-spa',
          title: '🧖‍♀️ 煙波男女三溫暖水療放鬆 · 暖呼呼舒壓享受',
          timing: 'Day 1 晚上 20:30',
          location: '煙波大飯店 俱樂部設施',
          description: '享受煙波著名的冷熱水療池、蒸氣室與烤箱，洗淨一週的工作疲倦，全身舒暢暖呼呼！',
          isUnlocked: false,
          unlockCode: '1017',
          hint: '第一天晚上 20:30 煙波水療三溫暖放鬆 🧖‍♀️',
          category: 'activity',
          activityId: 'act-1-5',
          dayNumber: 1,
          sourceType: 'itinerary'
        });
        changed = true;
      }

      // Fix ID mapping mismatches and remove any forced 法式
      updatedSurprises = updatedSurprises.map(s => {
        let updated = s;
        // Fix surp-2 (clinic) activityId to act-1-6
        if (updated.id === 'surp-2' && updated.activityId !== 'act-1-6') {
          changed = true;
          updated = { ...updated, activityId: 'act-1-6', title: '🩺 深夜 23:00 密醫看診時間 · 蔡醫師專屬身心靈放鬆推拿' };
        }
        // Fix surp-4 (escape room) activityId to act-2-4
        if (updated.id === 'surp-4' && updated.activityId !== 'act-2-4') {
          changed = true;
          updated = { ...updated, activityId: 'act-2-4', title: '🗝️ 密室逃脫通關特務挑戰 · 默契大考驗' };
        }
        // Fix surp-5 (dinner) activityId to act-2-5 and strip any lingering 法式
        if (updated.id === 'surp-5' && (updated.activityId !== 'act-2-5' || updated.title.includes('法式'))) {
          changed = true;
          updated = {
            ...updated,
            activityId: 'act-2-5',
            title: updated.title.replace(/法式浪漫奢華/g, '專屬浪漫').replace(/法式/g, '浪漫'),
            location: updated.location.includes('法式') ? '台南精緻浪漫餐廳' : updated.location,
            hint: updated.hint.includes('法式') ? '生日當晚的燭光浪漫慶生時刻 🕯️🎂' : updated.hint
          };
        }
        if (updated.title && updated.title.includes('法式')) {
          changed = true;
          updated = {
            ...updated,
            title: updated.title.replace(/法式浪漫奢華/g, '專屬浪漫').replace(/法式/g, '浪漫')
          };
        }
        return updated;
      });

      // Deduplicate surprises by ID and clean title to prevent duplicate entries
      const uniqueSurprises: SurpriseItem[] = [];
      const seenIds = new Set<string>();
      const seenTitles = new Set<string>();
      for (const s of updatedSurprises) {
        if (!s || !s.title) continue;
        const norm = s.title.replace(/^[\s\S]*?[🕯️🎂🍽️🧖‍♀️🩺🗝️✨💌🎁📸\s]+/u, '').trim().toLowerCase();
        if (seenIds.has(s.id)) {
          changed = true;
          continue;
        }
        if (norm.length > 2 && seenTitles.has(norm)) {
          changed = true;
          continue;
        }
        seenIds.add(s.id);
        if (norm.length > 2) seenTitles.add(norm);
        uniqueSurprises.push(s);
      }
      updatedSurprises = uniqueSurprises;

      // Also clean up any lingering 法式 or duplicates in standaloneSurprises
      let updatedStandalone = prev.standaloneSurprises;
      if (Array.isArray(updatedStandalone) && updatedStandalone.length > 0) {
        const uniqueStandalone: SurpriseItem[] = [];
        for (const s of updatedStandalone) {
          if (!s || !s.title) continue;
          const norm = s.title.replace(/^[\s\S]*?[🕯️🎂🍽️🧖‍♀️🩺🗝️✨💌🎁📸\s]+/u, '').trim().toLowerCase();
          if (seenIds.has(s.id) || (norm.length > 2 && seenTitles.has(norm))) {
            changed = true;
            continue;
          }
          let cleanS = s;
          if (cleanS.title.includes('法式')) {
            changed = true;
            cleanS = {
              ...cleanS,
              title: cleanS.title.replace(/法式浪漫奢華/g, '專屬浪漫').replace(/法式/g, '浪漫')
            };
          }
          seenIds.add(cleanS.id);
          if (norm.length > 2) seenTitles.add(norm);
          uniqueStandalone.push(cleanS);
        }
        updatedStandalone = uniqueStandalone;
      }

      if (changed) {
        const cleaned: BirthdayTripData = {
          ...prev,
          activeLiveAlert: newActiveLiveAlert,
          customAlertScenarios: newCustomAlerts,
          itinerary: newItinerary,
          surprises: sortSurprisesByStartTime(updatedSurprises),
          standaloneSurprises: updatedStandalone
        };
        saveTripData(cleaned);
        syncTripToCloud(cleaned);
        return cleaned;
      }
      return prev;
    });
  }, []);

  // Ensure girlfriend or guest is never stranded on organizer-only tabs (themes, budget)
  useEffect(() => {
    if (!isBoyfriend && (activeTab === 'themes' || activeTab === 'budget')) {
      setActiveTab('home');
    }
  }, [isBoyfriend, activeTab]);

  const handleResetAllSurprisesAndAlerts = () => {
    try {
      confetti.reset();
    } catch (e) {}
    try {
      sessionStorage.removeItem('qingbao_dismissed_alerts');
      localStorage.removeItem('qingbao_dismissed_alerts');
      sessionStorage.removeItem('qingbao_unlocked_surprises');
      setDismissedAlertIds(new Set());
      lastAutoPoppedScenarioIdRef.current = null;
      lastAutoPoppedAlertIdRef.current = null;
      
      const updated: BirthdayTripData = {
        ...tripData,
        activeLiveAlert: undefined,
        settings: {
          ...tripData.settings,
          hiddenScenarioIds: []
        }
      };
      setTripData(updated);
      saveTripData(updated);
      syncTripToCloud(updated);
      
      setSentToast('✨ 已重置所有驚喜與通知！所有卡片與情境已可重新觸發。');
      setTimeout(() => setSentToast(null), 4500);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to check if a live alert is fresh (sent within 20 minutes) to avoid stale test popups
  const isLiveAlertRecent = (alert?: BirthdayTripData['activeLiveAlert']): boolean => {
    if (!alert?.id) return false;
    if (alert.sentAt) {
      const sentTime = new Date(alert.sentAt).getTime();
      if (!isNaN(sentTime)) {
        const diffMinutes = (Date.now() - sentTime) / (1000 * 60);
        // If sent more than 20 minutes ago, it's stale and should not aggressively pop up
        if (diffMinutes > 20) {
          return false;
        }
      }
    }
    return true;
  };

  // 1. Subscribe to Real-time Cloud updates (so girlfriend & boyfriend sync instantly)
  useEffect(() => {
    const unsubscribe = subscribeToTripFromCloud((cloudData) => {
      if (cloudData && cloudData.settings) {
        setTripData(cloudData);
        saveTripData(cloudData);

        // ONLY trigger alert modal for Girlfriend (Receiver), NOT for Boyfriend (Sender)
        // AND ONLY if the alert is recent (not a stale test alert from hours/days ago)
        if (!isBoyfriend && cloudData.activeLiveAlert && cloudData.activeLiveAlert.id && isLiveAlertRecent(cloudData.activeLiveAlert)) {
          const alertId = cloudData.activeLiveAlert.id;
          const scenarioId = cloudData.activeLiveAlert.scenarioId;
          
          // Manual push from boyfriend is REAL-TIME IMMEDIATE
          if (!dismissedAlertIds.has(alertId)) {
            if (lastAutoPoppedAlertIdRef.current !== alertId) {
              lastAutoPoppedAlertIdRef.current = alertId;
              const scenarioMatch: LiveAlertScenario = {
                id: scenarioId || alertId,
                triggerTime: cloudData.activeLiveAlert.timeLabel || '',
                timeLabel: cloudData.activeLiveAlert.timeLabel || '',
                title: cloudData.activeLiveAlert.title || '專屬通知',
                message: cloudData.activeLiveAlert.message || '',
                secondaryHint: cloudData.activeLiveAlert.secondaryHint,
                category: cloudData.activeLiveAlert.category || 'dinner',
                badge: cloudData.activeLiveAlert.badge || '蔡寶即時發送'
              };
              setActiveScenario(scenarioMatch);
              setIsAlertModalOpen(true);
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, [isBoyfriend, effectiveTime, simulatedTime, dismissedAlertIds]);

  // Auto-seed to fresh Firestore database when authorized user is logged in
  useEffect(() => {
    if (isAuthorizedEditor) {
      fetchTripFromCloud().then(cloudData => {
        if (!cloudData || !cloudData.settings || !cloudData.itinerary) {
          console.log('Seeding initial trip data to fresh Firestore database...');
          syncTripToCloud(tripData);
        }
      }).catch(err => {
        console.warn('Auto cloud seed check notice:', err);
      });
    }
  }, [isAuthorizedEditor, tripData]);

  // 2. Time-based Alert Trigger & Queue (For Girlfriend view / Time Simulator)
  useEffect(() => {
    if (isBoyfriend) {
      return;
    }

    // A. Manual push alert trigger (REAL-TIME IMMEDIATE, only if fresh)
    if (tripData.activeLiveAlert?.id && isLiveAlertRecent(tripData.activeLiveAlert)) {
      const alertId = tripData.activeLiveAlert.id;
      const scenarioId = tripData.activeLiveAlert.scenarioId;

      if (!dismissedAlertIds.has(alertId)) {
        if (lastAutoPoppedAlertIdRef.current !== alertId) {
          lastAutoPoppedAlertIdRef.current = alertId;
          const scenarioMatch: LiveAlertScenario = {
            id: scenarioId || alertId,
            triggerTime: tripData.activeLiveAlert.timeLabel || '',
            timeLabel: tripData.activeLiveAlert.timeLabel || '',
            title: tripData.activeLiveAlert.title || '專屬通知',
            message: tripData.activeLiveAlert.message || '',
            secondaryHint: tripData.activeLiveAlert.secondaryHint,
            category: tripData.activeLiveAlert.category || 'dinner',
            badge: tripData.activeLiveAlert.badge || '蔡寶即時發送'
          };
          setActiveScenario(scenarioMatch);
          setIsAlertModalOpen(true);
          return;
        }
      }
    }

    // B. Automatic scheduled trigger (when simulated or real time progresses into scenario window)
    if (unreadDueScenarios.length > 0) {
      const latestDue = unreadDueScenarios[unreadDueScenarios.length - 1];
      // Only auto-pop up once per scenario. If user closes via 'X', it remains in the unread queue pill without re-popping
      if (latestDue && lastAutoPoppedScenarioIdRef.current !== latestDue.id) {
        lastAutoPoppedScenarioIdRef.current = latestDue.id;
        setActiveScenario(latestDue);
        setIsAlertModalOpen(true);
      }
    }
  }, [effectiveTime, isBoyfriend, tripData.activeLiveAlert, simulatedTime, unreadDueScenarios, dismissedAlertIds]);

  // 3. Auto-save locally whenever tripData changes
  useEffect(() => {
    saveTripData(tripData);
  }, [tripData]);

  // Acknowledge one scenario (Called when girlfriend clicks "我知道了")
  const handleAcknowledgeScenario = (scenarioId: string) => {
    markAlertDismissed(scenarioId);

    if (tripData.activeLiveAlert?.id) {
      markAlertDismissed(tripData.activeLiveAlert.id);
    }

    // Whenever girlfriend acknowledges, clear the active live broadcast from cloud and storage
    if (tripData.activeLiveAlert) {
      const updated: BirthdayTripData = {
        ...tripData,
        activeLiveAlert: undefined
      };
      setTripData(updated);
      saveTripData(updated);
      syncTripToCloud(updated);
    }
  };

  // Close alert modal (Temporary close via 'X' or when queue is finished)
  const handleCloseAlertModal = () => {
    try {
      confetti.reset();
    } catch (e) {}
    if (activeScenario) {
      markAlertDismissed(activeScenario.id);
    }
    if (tripData.activeLiveAlert) {
      markAlertDismissed(tripData.activeLiveAlert.id);
      // When girlfriend closes the modal via 'X', also clear the broadcast from cloud so it won't linger
      const updated: BirthdayTripData = {
        ...tripData,
        activeLiveAlert: undefined
      };
      setTripData(updated);
      saveTripData(updated);
      syncTripToCloud(updated);
    }
    setIsAlertModalOpen(false);
    setActiveScenario(null);
  };

  // Clear or Recall active live alert (Boyfriend action to stop broadcast)
  const handleClearActiveLiveAlert = () => {
    const updated: BirthdayTripData = {
      ...tripData,
      activeLiveAlert: undefined
    };
    setTripData(updated);
    saveTripData(updated);
    syncTripToCloud(updated);
    setSentAlertId(null);
    setSentToast('⏹️ 已撤回/清除當前廣播，女友端將不再自動彈出此卡片');
    setTimeout(() => setSentToast(null), 3500);
  };

  const handleTriggerScenario = (scenario: LiveAlertScenario) => {
    setShowScenarioPicker(false);

    setSentAlertId(scenario.id);
    setSentToast(`✨ 已成功發送「${scenario.title}」至晴寶視角！`);
    setTimeout(() => {
      setSentAlertId(null);
      setSentToast(null);
    }, 4500);

    const newAlertId = 'alert-' + Date.now();
    const updated: BirthdayTripData = {
      ...tripData,
      activeLiveAlert: {
        id: newAlertId,
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
    setTripData(updated);
    saveTripData(updated);
    syncTripToCloud(updated);

    setIsAlertModalOpen(false);
    setActiveScenario(null);
  };

  // Time simulator handler for Boyfriend
  const handleTimeSimulatorPresetSelect = (preset: typeof TIME_SIMULATOR_PRESETS[0]) => {
    setSimulatedTime(preset.iso);

    if (!preset.iso) {
      setSentToast('⏰ 已恢復系統真實時間');
      setTimeout(() => setSentToast(null), 3500);
      return;
    }

    let scenario: LiveAlertScenario | undefined;

    // 1. Dynamic match by triggerTime (within 30 minutes)
    if (preset.iso) {
      const presetTs = new Date(preset.iso).getTime();
      scenario = allScenarios.find(s => {
        const sTs = extractTimestampFromTiming(s.triggerTime);
        return Math.abs(sTs - presetTs) <= 30 * 60 * 1000;
      });
    }

    // 2. Keyword fallback match if specific scenario preset
    if (!scenario) {
      const pLabel = preset.label;
      scenario = allScenarios.find(s => {
        if (pLabel.includes('三溫暖') && s.title.includes('三溫暖')) return true;
        if (pLabel.includes('密醫') && s.title.includes('密醫')) return true;
        if (pLabel.includes('密室') && s.title.includes('密室')) return true;
        if (pLabel.includes('大餐') && (s.title.includes('晚餐') || s.title.includes('大餐'))) return true;
        return false;
      });
    }

    if (scenario) {
      handleTriggerScenario(scenario);
      return;
    }

    // If selecting a non-surprise moment (e.g. 10/16 16:30 hotel checkin or 00:00 midnight),
    // clear activeLiveAlert so previous alerts won't pop up!
    if (tripData.activeLiveAlert) {
      const updated: BirthdayTripData = {
        ...tripData,
        activeLiveAlert: undefined
      };
      setTripData(updated);
      saveTripData(updated);
      syncTripToCloud(updated);
    }

    setSentToast(`🕒 已切換時間至 ${preset.label}`);
    setTimeout(() => setSentToast(null), 3500);
  };

  // Sync Secret Itinerary with Surprises List & Alert Scenarios
  const handleSyncSecretSurprise = (activity: ActivityItem, dayNumber: number, isDeleted: boolean = false) => {
    setTripData(prev => {
      let updatedSurprises = [...prev.surprises];
      let updatedStandalone = [...(prev.standaloneSurprises || [])];
      let updatedCustom = [...(prev.customAlertScenarios || [])];

      if (isDeleted || !activity.isSecretSurprise) {
        // Remove from surprises
        updatedSurprises = updatedSurprises.filter(s => s.activityId !== activity.id && s.id !== `surp-act-${activity.id}`);
        // Remove from standalone
        updatedStandalone = updatedStandalone.filter(s => s.activityId !== activity.id && s.id !== `surp-act-${activity.id}`);
        // Remove from custom alerts
        updatedCustom = updatedCustom.filter(c => c.linkedSurpriseId !== activity.id && c.linkedSurpriseId !== `surp-act-${activity.id}` && c.id !== `alert-surp-act-${activity.id}`);
      } else if (activity.isSecretSurprise) {
        const existingIndex = updatedSurprises.findIndex(s => s.activityId === activity.id || s.id === `surp-act-${activity.id}`);
        const existing = existingIndex !== -1 ? updatedSurprises[existingIndex] : undefined;

        const timeMatch = activity.time.match(/(\d{1,2}:\d{2})/);
        const actTime = timeMatch ? timeMatch[1] : '18:00';
        const actDate = dayNumber === 1 ? '2026-10-16' : dayNumber === 3 ? '2026-10-18' : '2026-10-17';

        let surpriseCat: 'gift' | 'cake' | 'activity' | 'memory' | 'letter' = existing?.category || 'activity';
        if (activity.category === 'dining') surpriseCat = 'cake';
        else if (activity.category === 'sightseeing' || activity.category === 'photo_spot') surpriseCat = 'memory';
        else if (activity.category === 'birthday_surprise') surpriseCat = 'gift';

        const surpriseEntry: SurpriseItem = {
          id: existing?.id || 'surp-act-' + activity.id,
          title: activity.title,
          timing: `Day ${dayNumber} ${activity.time}`,
          date: actDate,
          time: actTime,
          location: activity.location || '台南神秘地點',
          description: activity.description || '由蔡寶為晴寶秘密安排的專屬浪漫行程！',
          isUnlocked: existing ? existing.isUnlocked : false,
          unlockCode: activity.surpriseUnlockCode || existing?.unlockCode || '0520',
          hint: activity.surpriseHint || existing?.hint || '秘密行程，等妳親自揭曉 💕',
          category: surpriseCat,
          activityId: activity.id,
          dayNumber,
          sourceType: 'itinerary',
          isStandalone: false
        };

        if (existingIndex !== -1) {
          updatedSurprises[existingIndex] = surpriseEntry;
        } else {
          updatedSurprises.push(surpriseEntry);
        }
      }

      const updated: BirthdayTripData = {
        ...prev,
        surprises: sortSurprisesByStartTime(updatedSurprises),
        standaloneSurprises: updatedStandalone,
        customAlertScenarios: updatedCustom
      };
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateTripData = (newData: BirthdayTripData) => {
    setTripData(newData);
    saveTripData(newData);
    syncTripToCloud(newData);
  };

  // Save / Update a Custom Alert Scenario (two-way synchronized with surprises & itinerary)
  const handleSaveCustomScenario = (scenario: LiveAlertScenario, _syncToSurprises: boolean = true) => {
    setTripData(prev => {
      let updatedSurprises = [...prev.surprises];
      let updatedStandalone = [...(prev.standaloneSurprises || [])];
      let updatedItinerary = [...prev.itinerary];

      // Parse date & time
      const dtParts = (scenario.triggerTime || '').split(' ');
      const date = dtParts[0] || '2026-10-16';
      const time = dtParts[1] || '18:00';
      const dayNumber = date === '2026-10-16' ? 1 : date === '2026-10-18' ? 3 : 2;

      // Find if this scenario matches an existing surprise
      const targetSurpriseId = scenario.linkedSurpriseId || scenario.id.replace(/^alert-/, '');
      const existingSurpriseIndex = updatedSurprises.findIndex(
        s => s.id === targetSurpriseId || (s.activityId && s.activityId === targetSurpriseId)
      );

      let surpriseId = targetSurpriseId;

      if (existingSurpriseIndex !== -1) {
        // Update existing surprise
        const existing = updatedSurprises[existingSurpriseIndex];
        const updatedItem: SurpriseItem = {
          ...existing,
          title: scenario.title,
          description: scenario.message,
          hint: scenario.secondaryHint,
          date,
          time,
          timing: scenario.timeLabel || `Day ${dayNumber} ${time}`,
          dayNumber
        };
        updatedSurprises[existingSurpriseIndex] = updatedItem;

        const standaloneIdx = updatedStandalone.findIndex(s => s.id === existing.id);
        if (standaloneIdx !== -1) {
          updatedStandalone[standaloneIdx] = updatedItem;
        }

        if (existing.activityId) {
          updatedItinerary = updatedItinerary.map(day => ({
            ...day,
            activities: (day.activities || []).map(act => {
              if (act.id === existing.activityId) {
                return {
                  ...act,
                  title: scenario.title,
                  time,
                  description: scenario.message,
                  surpriseHint: scenario.secondaryHint,
                  isSecretSurprise: true
                };
              }
              return act;
            })
          }));
        }
      } else {
        // Create new standalone surprise
        surpriseId = scenario.linkedSurpriseId || `surp-${Date.now()}`;
        const newSurprise: SurpriseItem = {
          id: surpriseId,
          title: scenario.title,
          timing: scenario.timeLabel || `Day ${dayNumber} ${time}`,
          date,
          time,
          dayNumber,
          location: '台南專屬浪漫站點',
          description: scenario.message,
          hint: scenario.secondaryHint || '蔡寶精心準備的驚喜！💕',
          isUnlocked: false,
          unlockCode: '0520',
          category: scenario.category === 'birthday' ? 'cake' : scenario.category === 'escape' ? 'activity' : 'gift',
          isStandalone: true,
          sourceType: 'standalone'
        };
        updatedSurprises.push(newSurprise);
        updatedStandalone.push(newSurprise);
      }

      const scenarioWithLink: LiveAlertScenario = {
        ...scenario,
        linkedSurpriseId: surpriseId
      };

      const existingCustom = prev.customAlertScenarios || [];
      const customExists = existingCustom.some(s => s.id === scenario.id || (s.linkedSurpriseId && s.linkedSurpriseId === surpriseId));
      let updatedCustom: LiveAlertScenario[];
      if (customExists) {
        updatedCustom = existingCustom.map(s => 
          (s.id === scenario.id || (s.linkedSurpriseId && s.linkedSurpriseId === surpriseId)) ? scenarioWithLink : s
        );
      } else {
        updatedCustom = [...existingCustom, scenarioWithLink];
      }

      const updated: BirthdayTripData = {
        ...prev,
        itinerary: updatedItinerary,
        surprises: sortSurprisesByStartTime(updatedSurprises),
        standaloneSurprises: updatedStandalone,
        customAlertScenarios: sortScenariosByStartTime(updatedCustom)
      };

      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });

    setSentToast(`✨ 已成功儲存情境通報卡「${scenario.title}」！`);
    setTimeout(() => setSentToast(null), 3500);
  };

  // Delete an Alert Scenario (two-way synchronized: removes surprise & un-toggles secret itinerary item)
  const executeDeleteScenario = (scenarioId: string) => {
    const target = allScenarios.find(s => s.id === scenarioId);
    const title = target?.title || '這張驚喜卡片';
    const linkedSurpriseId = target?.linkedSurpriseId || scenarioId.replace(/^alert-/, '');

    setTripData(prev => {
      // 1. Remove from surprises
      const updatedSurprises = (prev.surprises || []).filter(
        s => s.id !== linkedSurpriseId && s.activityId !== linkedSurpriseId && s.id !== scenarioId
      );

      // 2. Remove from standaloneSurprises
      const updatedStandalone = (prev.standaloneSurprises || []).filter(
        s => s.id !== linkedSurpriseId && s.activityId !== linkedSurpriseId && s.id !== scenarioId
      );

      // 3. If tied to an itinerary activity, set isSecretSurprise = false!
      const updatedItinerary = (prev.itinerary || []).map(day => ({
        ...day,
        activities: (day.activities || []).map(act => {
          if (act.id === linkedSurpriseId || `surp-act-${act.id}` === linkedSurpriseId) {
            return { ...act, isSecretSurprise: false };
          }
          return act;
        })
      }));

      // 4. Remove from customAlertScenarios
      const updatedCustom = (prev.customAlertScenarios || []).filter(
        s => s.id !== scenarioId && s.linkedSurpriseId !== linkedSurpriseId
      );

      const updated: BirthdayTripData = {
        ...prev,
        itinerary: updatedItinerary,
        surprises: sortSurprisesByStartTime(updatedSurprises),
        standaloneSurprises: updatedStandalone,
        customAlertScenarios: updatedCustom
      };

      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });

    setScenarioToDelete(null);
    setSentToast(`🗑️ 已成功移除「${title}」卡片與對應驚喜項目`);
    setTimeout(() => setSentToast(null), 3500);
  };

  const handleDeleteScenario = (scenario: LiveAlertScenario) => {
    setScenarioToDelete(scenario);
  };

  // Preview an Alert Scenario pop-up modal directly on Boyfriend screen
  const handlePreviewScenario = (scenario: LiveAlertScenario) => {
    setShowScenarioPicker(false);
    setActiveScenario(scenario);
    setIsAlertModalOpen(true);
  };

  // Save editable day highlights
  const handleSaveDayHighlights = (highlights: DayHighlightCard[]) => {
    const updated: BirthdayTripData = {
      ...tripData,
      settings: {
        ...tripData.settings,
        dayHighlights: highlights
      }
    };
    setTripData(updated);
    saveTripData(updated);
    syncTripToCloud(updated);
    setSentToast('✨ 已成功儲存行程速覽文案！');
    setTimeout(() => setSentToast(null), 3500);
  };

  // Quick converter from SurpriseItem to Live Alert Scenario
  const handleOpenAddScenarioFromSurprise = (surprise: SurpriseItem) => {
    const newScenario: LiveAlertScenario = {
      id: `alert-custom-${Date.now()}`,
      triggerTime: surprise.timing || '10/17 12:00',
      timeLabel: surprise.timing || '10/17 12:00',
      title: `✨ ${surprise.title}`,
      message: surprise.description || `專屬於晴寶的神秘驚喜：${surprise.title}`,
      secondaryHint: surprise.hint || '快跟著蔡寶一起解鎖這個浪漫時刻吧！',
      category: surprise.category === 'cake' ? 'birthday' : surprise.category === 'activity' ? 'escape' : 'sparkles',
      badge: '蔡寶準備的驚喜',
      isCustom: true,
      linkedSurpriseId: surprise.id
    };
    setEditingScenario(newScenario);
    setIsAddEditAlertOpen(true);
  };

  const handleUpdateItinerary = (newItinerary: BirthdayTripData['itinerary']) => {
    setTripData(prev => {
      const intermediate = { ...prev, itinerary: newItinerary };
      const consolidated = getConsolidatedSurprises(intermediate);
      const updated = {
        ...intermediate,
        surprises: consolidated
      };
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateSurprises = (newSurprises: BirthdayTripData['surprises']) => {
    setTripData(prev => {
      const updated = updateConsolidatedSurprises(prev, newSurprises);
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateDining = (newDining: BirthdayTripData['dining']) => {
    setTripData(prev => {
      const updated = { ...prev, dining: newDining };
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdatePacking = (newPacking: BirthdayTripData['packingList']) => {
    setTripData(prev => {
      const updated = { ...prev, packingList: newPacking };
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateExpenses = (newExpenses: BirthdayTripData['expenses']) => {
    setTripData(prev => {
      const updated = { ...prev, expenses: newExpenses };
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdatePhotos = (newPhotos: BirthdayTripData['photos']) => {
    setTripData(prev => {
      const updated = { ...prev, photos: newPhotos };
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateLoveLetter = (newLetter: BirthdayTripData['loveLetter']) => {
    setTripData(prev => {
      const updated = { ...prev, loveLetter: newLetter };
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  const handleUpdateSettings = (newSettings: BirthdayTripData['settings']) => {
    setTripData(prev => {
      const updated = { ...prev, settings: newSettings };
      saveTripData(updated);
      syncTripToCloud(updated);
      return updated;
    });
  };

  // Strict Gatekeeper: Block all views, tabs, surprises, and contents for unauthenticated guests
  if (isGuest || !isAuthorizedEditor) {
    return <GuestGatekeeper tripData={tripData} />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: 'var(--romantic-bg)', color: 'var(--romantic-ink)' }}
    >
      
      {/* Top Role and Time Lock Simulator Bar */}
      <RoleAndSimulatorBar
        boyfriendName={tripData.settings.boyfriendName || '蔡寶'}
        girlfriendName={tripData.settings.girlfriendName || '晴寶'}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDbInspector={() => setIsDbInspectorOpen(true)}
        onOpenThemeStudio={() => setActiveTab('themes')}
        onSelectTimePreset={handleTimeSimulatorPresetSelect}
        onResetAlerts={handleResetAllSurprisesAndAlerts}
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

      {/* Main Content Body with unconstrained modal stacking */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Global Floating Toast for Trigger Confirmation */}
        {sentToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#2C221E] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#DEC180] flex items-center space-x-2.5 animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5 text-[#DEC180] shrink-0 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">{sentToast}</span>
          </div>
        )}

        {/* Tab Views */}
        <div className="transition-all duration-300">
          {activeTab === 'home' && (
            <HomeView
              tripData={tripData}
              onOpenLoveLetter={() => setIsLoveLetterOpen(true)}
              onTriggerSurpriseModal={() => setIsSurpriseModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              allScenarios={allScenarios}
              onTriggerScenario={handleTriggerScenario}
              onOpenAddScenario={() => {
                setEditingScenario(null);
                setIsAddEditAlertOpen(true);
              }}
              onOpenScenarioPicker={() => setShowScenarioPicker(true)}
              onResetAlerts={handleResetAllSurprisesAndAlerts}
              onClearActiveAlert={handleClearActiveLiveAlert}
              sentAlertId={sentAlertId}
              onSaveDayHighlights={handleSaveDayHighlights}
            />
          )}

          {activeTab === 'itinerary' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ItineraryView
                itinerary={tripData.itinerary}
                onUpdateItinerary={handleUpdateItinerary}
                secretModePassword={tripData.settings.secretModePassword}
                onSyncSecretSurprise={handleSyncSecretSurprise}
              />
            </div>
          )}

          {activeTab === 'snacks' && (
            <SnackWishlistView
              girlfriendName={tripData.settings.girlfriendName || '晴寶'}
              boyfriendName={tripData.settings.boyfriendName || '蔡寶'}
            />
          )}

          {activeTab === 'surprises' && (
            <SurprisePlanner
              surprises={sortedSurprises}
              onUpdateSurprises={handleUpdateSurprises}
              secretModePassword={tripData.settings.secretModePassword}
              onCreateAlertCard={handleOpenAddScenarioFromSurprise}
            />
          )}

          {activeTab === 'dining' && (
            isBoyfriend ? (
              <DiningTracker
                diningList={tripData.dining}
                onUpdateDining={handleUpdateDining}
              />
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-[var(--romantic-border,#BAE6FD)] text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[var(--romantic-ink,#0F172A)]">
                  🔒 專屬神秘訂位資訊封存中
                </h3>
                <p className="text-sm text-[var(--romantic-muted,#64748B)] max-w-md mx-auto font-serif">
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
              <div className="p-8 bg-white rounded-3xl border border-[var(--romantic-border,#BAE6FD)] text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 fill-[var(--romantic-rose,#0284C7)] text-[var(--romantic-rose,#0284C7)]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[var(--romantic-ink,#0F172A)]">
                  👑 晴寶只需盡情享受旅程！
                </h3>
                <p className="text-sm text-[var(--romantic-muted,#64748B)] max-w-md mx-auto font-serif">
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

          {activeTab === 'themes' && (
            <ThemeStudioView />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[var(--romantic-border,#BAE6FD)] bg-white/70 backdrop-blur-xs py-8 text-center text-xs text-[var(--romantic-muted,#64748B)]">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-1.5 font-serif text-[var(--romantic-rose,#0284C7)] font-medium">
            <span>Made with deep love by {tripData.settings.boyfriendName || '蔡寶'}</span>
            <Star className="w-4 h-4 fill-[var(--romantic-rose,#0284C7)] text-[var(--romantic-rose,#0284C7)] animate-pulse" />
            <span>For {tripData.settings.girlfriendName || '晴寶'} Birthday Trip</span>
          </div>

          <p className="text-[var(--romantic-muted,#64748B)]">
            台南 Tainan · {tripData.settings.startDate} ~ {tripData.settings.endDate} · ⭐ 晴寶 10/17 生日快樂！
          </p>
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

      {/* Floating Surprise Alert Queue Pill for Girlfriend only (strictly hidden for Boyfriend & hidden when empty) */}
      {!isBoyfriend && unreadDueScenarios.length > 0 && !isAlertModalOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <button
            onClick={() => {
              setActiveScenario(unreadDueScenarios[unreadDueScenarios.length - 1]);
              setIsAlertModalOpen(true);
            }}
            className="btn-romantic-primary text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-white/50 cursor-pointer hover:scale-105 transition-all"
            title="查看目前時間點已解鎖的未讀驚喜卡片"
          >
            <Bell className="w-4 h-4 animate-pulse" />
            <span>📬 驚喜卡片柱列 ({unreadDueScenarios.length}則未讀)</span>
          </button>
        </div>
      )}

      {/* Live Alert Modal */}
      <LiveAlertModal
        isOpen={isAlertModalOpen}
        onClose={handleCloseAlertModal}
        onAcknowledgeScenario={handleAcknowledgeScenario}
        scenario={activeScenario}
        dueScenarios={unreadDueScenarios}
        onSelectScenario={(s) => setActiveScenario(s)}
        girlfriendName={tripData.settings.girlfriendName || '晴寶'}
        boyfriendName={tripData.settings.boyfriendName || '蔡寶'}
      />

      {/* All Scenarios Picker Modal */}
      {showScenarioPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-[var(--romantic-border,#BAE6FD)] max-h-[90vh] overflow-y-auto text-[var(--romantic-ink,#0F172A)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--romantic-border,#BAE6FD)]">
              <h3 className="text-lg font-bold text-[var(--romantic-ink,#0F172A)] flex items-center space-x-2 font-serif">
                <Bell className="w-5 h-5 text-[var(--romantic-rose,#0284C7)]" />
                <span>專屬行程互動即時情境通知管理中心</span>
              </h3>
              <button
                onClick={() => setShowScenarioPicker(false)}
                className="text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <p className="text-xs text-[var(--romantic-muted,#64748B)]">
                  點擊任一卡片立即推播或模擬體驗；蔡寶可隨時新增自訂驚喜：
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center space-x-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>已按時間排序</span>
                </span>
              </div>
              <button
                onClick={() => {
                  setEditingScenario(null);
                  setIsAddEditAlertOpen(true);
                }}
                className="px-3 py-1 rounded-xl btn-romantic-primary text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center space-x-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增驚喜卡片</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {allScenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-4 rounded-2xl border border-[var(--romantic-border,#BAE6FD)] hover:border-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] transition-all flex items-center justify-between group"
                >
                  <div 
                    onClick={() => handlePreviewScenario(sc)}
                    className="space-y-1 flex-1 cursor-pointer pr-3"
                    title="點擊卡片本體可直接預覽彈窗效果"
                  >
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]">
                        {sc.timeLabel}
                      </span>
                      <span className="text-xs text-[var(--romantic-muted,#64748B)]">{sc.badge}</span>
                      {sc.isCustom ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                          自訂
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                          系統預設
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[var(--romantic-ink,#0F172A)] group-hover:text-[var(--romantic-rose,#0284C7)]">
                      {sc.title}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {sc.message}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* Preview Button */}
                    <button
                      onClick={() => handlePreviewScenario(sc)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      title="👁️ 預覽彈窗（在您的螢幕查看效果）"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Button (For custom cards) */}
                    {sc.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingScenario(sc);
                          setIsAddEditAlertOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-[var(--romantic-rose,#0284C7)] hover:bg-white transition-colors cursor-pointer"
                        title="✏️ 編輯此卡片內容"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete / Remove Card Button (For ALL cards) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScenario(sc);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={sc.isCustom ? "🗑️ 刪除這張自訂卡片" : "🗑️ 移除此預設卡片"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Live Send Button */}
                    <button
                      onClick={() => handleTriggerScenario(sc)}
                      className="px-3 py-1.5 rounded-xl btn-romantic-primary text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                      title="⚡ 即時發送至晴寶手機視角（不受時間限制，立即彈出！）"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>發送</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between">
              <button
                onClick={() => {
                  handleResetAllSurprisesAndAlerts();
                  setShowScenarioPicker(false);
                }}
                className="text-xs text-[var(--romantic-rose,#0284C7)] hover:underline flex items-center space-x-1 font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>🔄 重置所有通知已讀狀態</span>
              </button>

              <button
                onClick={() => setShowScenarioPicker(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium text-[var(--romantic-ink,#0F172A)] cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Alert Card Modal */}
      {isAddEditAlertOpen && (
        <AddEditAlertCardModal
          isOpen={isAddEditAlertOpen}
          onClose={() => {
            setIsAddEditAlertOpen(false);
            setEditingScenario(null);
          }}
          onSave={handleSaveCustomScenario}
          initialScenario={editingScenario}
          existingSurprises={sortedSurprises}
          existingItinerary={tripData.itinerary}
        />
      )}

      {/* Delete / Remove Card Confirmation Modal (Replaces browser-blocked window.confirm) */}
      {scenarioToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-rose-100 text-[var(--romantic-ink,#0F172A)] animate-in zoom-in-95">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {scenarioToDelete.isCustom ? '確認刪除此自訂驚喜卡片？' : '確認從列表移除此卡片？'}
                </h3>
                <p className="text-xs text-slate-500">
                  {scenarioToDelete.isCustom ? '此操作將自資料庫完全刪除。' : '此操作將隱藏此預設情境卡片，隨時可按「重置」恢復。'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)]">
                  {scenarioToDelete.timeLabel}
                </span>
                <span className="text-xs text-slate-500">{scenarioToDelete.badge}</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {scenarioToDelete.title}
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">
                {scenarioToDelete.message}
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setScenarioToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => executeDeleteScenario(scenarioToDelete.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>確認移除</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
