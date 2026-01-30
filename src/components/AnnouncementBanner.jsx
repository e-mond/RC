// src/components/AnnouncementBanner.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, AlertTriangle } from "lucide-react";
import { getAnnouncements } from "@/services/announcementService";
import { useAuthStore } from "@/stores/authStore";
import useOutsideClick from "@/hooks/useOutsideClick";

// Audio files – different tones for each severity
const SOUNDS = {
  info: "https://orangefreesounds.com/wp-content/uploads/2023/07/Announcement-chime-sound-effect.mp3",      // Soft, elegant chime
  warning: "https://notificationsounds.com/storage/sounds/file-sounds-1141-unconvinced.mp3",                 // Subtle alert beep
  critical: "https://notificationsounds.com/storage/sounds/file-sounds-1153-urgent-simple-tone.mp3",         // Urgent, sharp warning
};

const getSeverityIcon = (severity = "info") => {
  const lower = (severity || "info").toLowerCase();
  if (lower === "warning") return <AlertTriangle className="h-9 w-9 text-amber-300" />;
  if (lower === "critical") return <AlertTriangle className="h-9 w-9 text-red-300 animate-pulse" />;
  return <Megaphone className="h-9 w-9 text-blue-200" />;
};

const getGradient = (severity = "info") => {
  const lower = (severity || "info").toLowerCase();
  if (lower === "warning") return "from-amber-600/95 to-orange-700/95";
  if (lower === "critical") return "from-red-600/95 to-rose-700/95";
  return "from-indigo-600/95 to-blue-700/95";
};

export default function AnnouncementBanner() {
  const { user, isAuthenticated } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.last_login) return;

    const loadAnnouncements = async () => {
      try {
        const data = await getAnnouncements();

        const lastLogin = new Date(user.last_login);
        const newAnnouncements = data
          .filter(ann => new Date(ann.created_at) > lastLogin)
          .filter(ann => ann.is_active !== false)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (newAnnouncements.length > 0) {
          // Debug: Confirm severity is coming from backend
          console.log("New announcements severities:", newAnnouncements.map(ann => ann.severity || "missing"));

          // Play sound only when truly new announcements arrive
          if (newAnnouncements.length > announcements.length) {
            // Get highest severity among new ones
            const highest = newAnnouncements.reduce((max, ann) => {
              const order = { critical: 3, warning: 2, info: 1 };
              const currOrder = order[ann.severity?.toLowerCase()] || 1;
              return currOrder > (order[max?.severity?.toLowerCase()] || 1) ? ann : max;
            }, newAnnouncements[0]);

            const severity = highest.severity?.toLowerCase() || "info";
            const soundUrl = SOUNDS[severity] || SOUNDS.info;

            const audio = new Audio(soundUrl);
            audio.volume = severity === "critical" ? 0.85 : severity === "warning" ? 0.7 : 0.55;
            audio.play().catch(e => console.log("Audio play blocked:", e));
          }

          setAnnouncements(newAnnouncements);
          setIsVisible(true);
        }
      } catch (err) {
        console.error("Failed to load announcements:", err);
      }
    };

    loadAnnouncements();

    const interval = setInterval(loadAnnouncements, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.last_login, announcements.length]);

  useOutsideClick(bannerRef, () => {
    if (isVisible) setIsVisible(false);
  });

  if (!isVisible || announcements.length === 0) return null;

  const first = announcements[0];
  const gradient = getGradient(first?.severity);
  const icon = getSeverityIcon(first?.severity);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-4 px-4 pointer-events-none">
          <motion.div
            ref={bannerRef}
            initial={{ y: -120, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -120, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 110 }}
            className={`pointer-events-auto w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-white bg-gradient-to-r ${gradient}`}
          >
            <div className="px-6 py-6 md:px-8 md:py-7">
              <div className="flex items-start justify-between gap-6">
                {/* Icon + Main Content */}
                <div className="flex items-start gap-5 flex-1">
                  <div className="mt-1.5 flex-shrink-0">
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl md:text-2xl tracking-tight leading-tight">
                      {first.title}
                    </h3>
                    <p className="mt-2.5 text-base md:text-lg opacity-90 leading-relaxed line-clamp-2 md:line-clamp-none">
                      {first.message}
                    </p>

                    {announcements.length > 1 && (
                      <p className="mt-3 text-sm opacity-80">
                        + {announcements.length - 1} more announcement{announcements.length > 2 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-3 rounded-full hover:bg-white/20 transition-colors flex-shrink-0 shrink-0 mt-1"
                  aria-label="Close announcements"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}