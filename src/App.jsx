import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Clock,
  MapPin,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  UserCheck,
  UserX,
  X,
  Gift,
  Calendar,
  Users,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import foto1 from "./assets/boda.jpeg";
import foto2 from "./assets/img2.jpg";
import foto3 from "./assets/img3.jpg";
import foto4 from "./assets/img4.jpeg";
import musicaBoda from "./assets/boda.mp3";
import { supabase } from "./supabaseClient";

const WEDDING_DATE = new Date("2026-10-10T15:00:00");

const WHATSAPP_BRIDE = "59167651169"; // Número de la Novia (Mariela)
const WHATSAPP_GROOM = "59174285090"; // Número del Novio (Daniel)
const INITIAL_GALLERY_IMAGES = [
  {
    id: 1,
    url: foto1,
    title: "Nuestra propuesta de matrimonio",
    location: "Momento inolvidable",
  },
  /*{
    id: 2,
    url: foto2,
    title: "Nuestra propuesta de matrimonio",
    location: "",
  },
  {
    id: 3,
    url: foto3,
    title: "Nuestra propuesta de matrimonio",
    location: "",
  },
  {
    id: 4,
    url: foto4,
    title: "Nuestra propuesta de matrimonio",
    location: "",
  },*/
];

const PARENTS_DATA = {
  groom: {
    father: "Justino Taquichiri Escalera (+)",
    mother: "Marcelina Huanca Vda. de Taquichiri",
  },
  bride: {
    father: "Carlos S. Meneses Llanos (+)",
    mother: "Ubaldina Jancko Vda. de Meneses",
  },
};

const GODPARENTS_DATA = [
  {
    role: "Padrinos de Católico",
    godfather: "Juan Marcial Singuri Muruchi",
    godmother: "Patricia Pacara de Singuri",
  },
  {
    role: "Padrinos de Civil",
    godfather: "Marco Huanca Taquichiri",
    godmother: "María Elena Fuertes de Huanca",
  },
  {
    role: "Padrinos de Aro",
    godfather: "Lic. Daniel Luna Arenas",
    godmother: "Lic. Cecilia Callahuanca de Luna",
  },
  {
    role: "Padrinos de Torta",
    godfather: "Ovidio Soto Mendoza",
    godmother: "Silvia Elvira Murillo de Soto",
  },
  {
    role: "Padrinos de Torta",
    godfather: "Froilán Jancko Cruz",
    godmother: "Heriberta Acebo de Jancko",
  },
  {
    role: "Padrinos de Tipaku",
    godfather: "Eleuterio Puita Mamani",
    godmother: "Benigna Taquichiri de Puita",
  },
  {
    role: "Padrinos de Video",
    godfather: "Iván Huanca Taquichiri",
    godmother: "Verónica Barahona de Huanca",
  },
  {
    role: "Padrinos de Altar",
    godfather: "Jhonny Gozalves Baptista",
    godmother: "Sandra Huanca de Gozalves",
  },
];

const TWO_DAYS_SCHEDULE = [
  {
    day: "Sábado 10 de Octubre",
    subtitle: "Ceremonia Religiosa & Traslado al Salón",
    icon: Sparkles,
    events: [
      {
        time: "15:00 PM",
        title: "Ceremonia Religiosa",
        detail: "Templo San Martín (Calle Hoyos)",
      },
      {
        time: "16:30 PM",
        title: "Salida de la Iglesia & Fotos",
        detail: "Felicitaciones, fotos y paseo con los novios",
      },
      {
        time: "18:00 PM",
        title: "Traslado al Salón de Eventos",
        detail: "Los invitados se dirigirán al Salón COSEP",
      },
    ],
  },
  {
    day: "Domingo 11 de Octubre",
    subtitle: "Gran Fiesta, Banquete & Regalos",
    icon: Heart,
    events: [
      {
        time: "17:00 PM",
        title: "Recepción de Invitados",
        detail: "Salón de Eventos COSEP (Calle Argote N°346)",
      },
      {
        time: "20:00 PM",
        title: "Banquete de Honor",
        detail: "Plato tradicional de fiesta",
      },
      {
        time: "22:00 PM",
        title: "Apertura del Baile & Tipaku",
        detail: "Entrega de regalos y fiesta bailable",
      },
    ],
  },
];

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const audioRef = useRef(null);
  const userWantsMusic = useRef(false);

  // Estado RSVP
  const [rsvpData, setRsvpData] = useState({
    fullName: "",
    email: "",
    phone: "",
    attending: "yes",
    guestsCount: "1",
    dietaryRestrictions: "",
    message: "",
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Entrada con música
  const handleEnterSite = () => {
    setHasEntered(true);
    userWantsMusic.current = true;
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch((err) => console.log("Error al reproducir audio:", err));
    }
  };

  // Pausar/reanudar música según visibilidad
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return;

      if (document.hidden) {
        if (isPlayingMusic) {
          audioRef.current.pause();
        }
      } else {
        if (userWantsMusic.current && hasEntered) {
          audioRef.current
            .play()
            .then(() => setIsPlayingMusic(true))
            .catch((err) => console.log("Error al reanudar audio:", err));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlayingMusic, hasEntered]);

  // Cuenta regresiva
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = WEDDING_DATE.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
        setIsPlayingMusic(false);
        userWantsMusic.current = false;
      } else {
        audioRef.current.play().catch((err) => console.log(err));
        setIsPlayingMusic(true);
        userWantsMusic.current = true;
      }
    }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!rsvpData.fullName) return;

    try {
      // ⚠️ ASEGÚRATE DE QUE EL NOMBRE DENTRO DE .from() SEA EXACTO
      const { data, error } = await supabase.from("confirmaciones").insert([
        {
          full_name: rsvpData.fullName,
          attending: rsvpData.attending,
          message: rsvpData.message,
        },
      ]);

      if (error) {
        console.error("Error de Supabase:", error);
        alert(`Error de Supabase: ${error.message}`);
      } else {
        setRsvpSubmitted(true);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A4238] font-serif selection:bg-[#D4AF37]/30 selection:text-[#3A3228]">
      {/* Modal de Portada Inicial */}
      {!hasEntered && (
        <div className="fixed inset-0 z-[100] bg-[#FAF7F2] flex flex-col items-center justify-center p-4 text-center select-none animate-fade-in">
          <div className="relative max-w-md w-full bg-[#FDFBF7] p-8 md:p-12 rounded-2xl border-2 border-[#D4AF37]/30 shadow-2xl space-y-6 overflow-hidden">
            {/* Marquitos de esquinas */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]"></div>
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]"></div>
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]"></div>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#D4AF37]/50 bg-[#F7F2EB] text-[#D4AF37] shadow-inner mb-2">
              <span className="text-xl font-serif tracking-widest font-bold">
                D &amp; M
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#8F9E8B] font-sans font-bold">
                Nuestra Boda
              </p>
              <h1 className="text-3xl md:text-4xl font-serif text-[#3A3228] font-normal leading-tight">
                Daniel <span className="text-[#D4AF37] italic">&amp;</span>{" "}
                Mariela
              </h1>
            </div>

            <div className="w-12 h-0.5 bg-[#D4AF37]/40 mx-auto"></div>

            <p className="text-xs font-serif italic text-[#7A6E63] leading-relaxed max-w-xs mx-auto">
              "Nuestro destino está escrito, no pudimos acabar de otra forma...
              ¡Celebremos juntos nuestro amor!"
            </p>

            <div className="pt-2">
              <button
                onClick={handleEnterSite}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#D4AF37] text-white rounded-full text-xs font-semibold uppercase tracking-[0.25em] shadow-xl hover:bg-[#C29F2F] active:scale-95 transition-all duration-300"
              >
                <span>Abrir Invitación</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">
                  ✨
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante de audio */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleMusic}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 border backdrop-blur-md ${
            isPlayingMusic
              ? "bg-[#8F9E8B] text-white border-[#8F9E8B] animate-pulse"
              : "bg-white/90 text-[#6B5E51] border-[#E2D9CC] hover:bg-[#F4EFEA]"
          }`}
          title={isPlayingMusic ? "Pausar música" : "Reproducir música"}
        >
          {isPlayingMusic ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
          <span className="text-xs font-sans uppercase tracking-widest font-semibold hidden md:inline">
            {isPlayingMusic ? "Música Activada" : "Música Ambiental"}
          </span>
        </button>
      </div>

      {/* Header / Banner Principal */}
      <header className="relative min-h-screen flex flex-col justify-center items-center text-center p-6 overflow-hidden bg-gradient-to-b from-[#F7F2EB] via-[#FDFBF7] to-[#F7F2EB]">
        {/* Estrellitas / Adornos decorativos de fondo en las esquinas */}
        <div className="absolute top-8 left-8 opacity-25 text-[#8F9E8B] pointer-events-none">
          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M50 0 C60 25, 75 40, 100 50 C75 60, 60 75, 50 100 C40 75, 25 60, 0 50 C25 40, 40 25, 50 0 Z" />
          </svg>
        </div>
        <div className="absolute bottom-8 right-8 opacity-25 text-[#D4AF37] pointer-events-none">
          <svg
            width="140"
            height="140"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <path d="M50 0 C60 25, 75 40, 100 50 C75 60, 60 75, 50 100 C40 75, 25 60, 0 50 C25 40, 40 25, 50 0 Z" />
          </svg>
        </div>

        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full border border-[#D4AF37]/40 bg-white/50 backdrop-blur-sm shadow-sm text-[#D4AF37]">
          <span className="text-2xl font-serif tracking-widest">D &amp; M</span>
        </div>

        <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-[#8F9E8B] font-sans font-medium mb-3">
          ¡Nos Casamos!
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#3A3228] font-normal tracking-wide my-2 leading-tight">
          Daniel{" "}
          <span className="text-[#D4AF37] italic font-serif text-4xl md:text-6xl">
            &amp;
          </span>{" "}
          Mariela
        </h1>

        <p className="max-w-lg text-sm md:text-base italic text-[#7A6E63] my-6 font-light leading-relaxed">
          "Motivados por el amor que nos une, con la alegría y la bendición de
          Dios y nuestros padres..."
        </p>

        <div className="flex items-center gap-4 my-4 py-2 px-6 border-y border-[#E2D9CC] text-[#4A4238]">
          <span className="text-xs md:text-sm uppercase tracking-widest font-sans font-semibold">
            Sábado
          </span>
          <span className="text-2xl md:text-3xl font-serif text-[#D4AF37]">
            10
          </span>
          <span className="text-xs md:text-sm uppercase tracking-widest font-sans font-semibold">
            y
          </span>
          <span className="text-xs md:text-sm uppercase tracking-widest font-sans font-semibold">
            Domingo
          </span>
          <span className="text-2xl md:text-3xl font-serif text-[#D4AF37]">
            11
          </span>

          <span className="text-xs md:text-sm uppercase tracking-widest font-sans font-semibold">
            de Octubre 2026
          </span>
        </div>

        {/* Indicador de Deslizar hacia abajo */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-80">
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#7A6E63] font-semibold">
            Desliza hacia abajo
          </span>
          <div className="w-6 h-10 border-2 border-[#D4AF37]/60 rounded-full flex justify-center pt-1.5 shadow-sm">
            <div className="w-1.5 h-3 bg-[#D4AF37] rounded-full animate-pulse"></div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#D4AF37] -mt-1" />
        </div>
      </header>

      {/* Cuenta Regresiva */}
      <section className="py-12 px-3 bg-white border-y border-[#E2D9CC]/50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-[0.3em] font-sans text-[#8F9E8B] font-semibold mb-1">
            Cuenta Regresiva
          </h2>
          <p className="text-xl md:text-3xl text-[#3A3228] font-serif mb-6">
            Faltan para el Gran Día
          </p>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
            {[
              { label: "Días", value: timeLeft.days },
              { label: "Horas", value: timeLeft.hours },
              { label: "Minutos", value: timeLeft.minutes },
              { label: "Segundos", value: timeLeft.seconds },
            ].map((item, index) => (
              <div
                key={index}
                className="py-3 px-1 sm:p-5 rounded-xl bg-[#FDFBF7] border border-[#E2D9CC] shadow-sm flex flex-col items-center justify-center"
              >
                <span className="text-2xl sm:text-4xl font-serif font-bold text-[#D4AF37] leading-none">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#7A6E63] font-sans mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Padres */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="inline-flex p-3 rounded-full bg-[#F7F2EB] text-[#D4AF37] mb-4">
          <Users className="w-6 h-6" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] font-sans text-[#8F9E8B] font-bold block">
          Con la bendición de Dios y nuestros padres
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-[#3A3228] mt-2 mb-4">
          Nuestros Padres
        </h2>
        <p className="text-xs md:text-sm font-serif italic text-[#7A6E63] max-w-md mx-auto mb-8">
          "Gracias a ellos por guiarnos con amor y ser la luz en cada paso de
          nuestro camino."
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm md:text-base">
          <div className="bg-white p-6 rounded-2xl border border-[#E2D9CC] shadow-sm space-y-1">
            <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-sans font-bold mb-3">
              Padres del Novio
            </p>
            <p className="font-semibold text-[#3A3228]">
              {PARENTS_DATA.groom.father}
            </p>
            <p className="text-[#5C5247]">{PARENTS_DATA.groom.mother}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2D9CC] shadow-sm space-y-1">
            <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-sans font-bold mb-3">
              Padres de la Novia
            </p>
            <p className="font-semibold text-[#3A3228]">
              {PARENTS_DATA.bride.father}
            </p>
            <p className="text-[#5C5247]">{PARENTS_DATA.bride.mother}</p>
          </div>
        </div>
      </section>

      {/* Ubicaciones */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] font-sans text-[#8F9E8B] font-semibold">
            ¿Dónde &amp; Cuándo?
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#3A3228] mt-2">
            Ubicaciones Principales
          </h2>
          <p className="text-xs md:text-sm font-serif italic text-[#7A6E63] mt-2">
            "Te esperamos para compartir la alegría de nuestro enlace y fiesta"
          </p>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Templo San Martin */}
          <div className="bg-white p-8 md:p-10 rounded-2xl border border-[#E2D9CC] shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="inline-flex p-3 rounded-full bg-[#F7F2EB] text-[#8F9E8B] mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-[#3A3228] mb-1">
                Ceremonia Religiosa
              </h3>
              <p className="text-xs font-sans text-[#8F9E8B] font-bold uppercase tracking-wider mb-6">
                Sábado 10 de Octubre
              </p>

              <div className="space-y-4 font-sans text-sm text-[#5C5247] mb-8">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <span>15:00 HRS p.m. </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#3A3228]">
                      Templo SAN MARTÍN
                    </p>
                    <p className="text-xs text-[#7A6E63]">
                      Calle Hoyos, Potosí
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/NHbdE2X8jWmCSzKY9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl border border-[#8F9E8B] text-[#8F9E8B] font-sans text-xs uppercase tracking-wider font-semibold hover:bg-[#8F9E8B] hover:text-white transition-colors"
            >
              <MapPin className="w-4 h-4" /> Ver Ubicación en Google Maps
            </a>
          </div>

          {/* Salon COSERP */}
          <div className="bg-white p-8 md:p-10 rounded-2xl border border-[#E2D9CC] shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="inline-flex p-3 rounded-full bg-[#F7F2EB] text-[#D4AF37] mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-[#3A3228] mb-1">
                Recepción &amp; Fiesta
              </h3>
              <p className="text-xs font-sans text-[#D4AF37] font-bold uppercase tracking-wider mb-6">
                Domingo 11 de Octubre
              </p>

              <div className="space-y-4 font-sans text-sm text-[#5C5247] mb-8">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <span>Desde las 17:00 HRS p.m. (5:00 PM)</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#3A3228]">
                      Salón de Eventos COSEP
                    </p>
                    <p className="text-xs text-[#7A6E63]">
                      Calle Argote N°346, Potosí
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/KyXqikWv4uc5LEU48"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl border border-[#D4AF37] text-[#D4AF37] font-sans text-xs uppercase tracking-wider font-semibold hover:bg-[#D4AF37] hover:text-white transition-colors"
            >
              <MapPin className="w-4 h-4" /> Ver Ubicación en Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* Programa */}
      <section className="py-20 px-4 bg-white border-y border-[#E2D9CC]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] font-sans text-[#8F9E8B] font-semibold">
              Programa de Celebración
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#3A3228] mt-2">
              Nuestros Días de Festividad
            </h2>
            <p className="text-xs md:text-sm font-serif italic text-[#7A6E63] mt-2">
              "Dos días de alegría para celebrar el amor, la amistad y nuestro
              nuevo comienzo"
            </p>
            <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {TWO_DAYS_SCHEDULE.map((dayItem, index) => {
              const IconComponent = dayItem.icon;
              return (
                <div
                  key={index}
                  className="bg-[#FDFBF7] p-6 sm:p-8 rounded-2xl border border-[#E2D9CC] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="inline-flex p-3 rounded-full bg-[#F7F2EB] text-[#D4AF37] mb-4">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#8F9E8B] block">
                      Día {index + 1}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#3A3228] mt-1">
                      {dayItem.day}
                    </h3>
                    <p className="text-xs font-sans text-[#7A6E63] italic mb-6">
                      {dayItem.subtitle}
                    </p>

                    <div className="space-y-4 border-t border-[#E2D9CC]/60 pt-4 font-sans text-xs">
                      {dayItem.events.map((ev, evIdx) => (
                        <div key={evIdx} className="space-y-0.5">
                          <p className="font-bold text-[#D4AF37] tracking-wider uppercase">
                            {ev.time}
                          </p>
                          <p className="font-semibold text-[#3A3228] text-sm">
                            {ev.title}
                          </p>
                          <p className="text-[#7A6E63]">{ev.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Padrinos */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-sans text-[#8F9E8B] font-semibold">
            Nuestra Corte de Honor
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#3A3228] mt-2">
            Nuestros Padrinos
          </h2>
          <p className="text-xs md:text-sm font-serif italic text-[#7A6E63] mt-2">
            "Personas especiales que acompañan nuestro caminar y bendicen
            nuestra unión"
          </p>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GODPARENTS_DATA.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-[#E2D9CC] shadow-sm flex flex-col justify-center text-center space-y-1 hover:border-[#D4AF37]/50 transition-colors"
            >
              <p className="text-xs font-sans uppercase tracking-widest text-[#D4AF37] font-bold mb-2">
                {item.role}
              </p>
              <p className="text-xs font-semibold text-[#3A3228]">
                {item.godfather}
              </p>
              <p className="text-xs text-[#5C5247]">{item.godmother}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Galería */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-sans text-[#8F9E8B] font-semibold">
            Nuestros Momentos
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#3A3228] mt-2">
            Galería de Fotos
          </h2>
          <p className="text-xs md:text-sm font-serif italic text-[#7A6E63] mt-2">
            "Cada recuerdo a tu lado es una historia llena de amor"
          </p>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {INITIAL_GALLERY_IMAGES.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative w-full sm:w-80 h-96 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                <p className="font-serif text-lg font-medium">{image.title}</p>
                <p className="text-xs font-sans text-white/80">
                  {image.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl max-h-[90vh] bg-transparent text-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[75vh] w-auto mx-auto rounded-lg shadow-2xl object-contain"
              />
              <p className="mt-4 text-xl font-serif text-white">
                {selectedImage.title}
              </p>
              <p className="text-sm font-sans text-white/70">
                {selectedImage.location}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* RSVP y Contacto WhatsApp */}
      <section className="py-20 px-4 bg-[#F7F2EB] border-y border-[#E2D9CC]">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-[#E2D9CC] shadow-xl">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.3em] font-sans text-[#8F9E8B] font-bold">
              Confirma tu Asistencia
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#3A3228] mt-2">
              RSVP &amp; Contacto
            </h2>
            <p className="text-xs font-sans text-[#7A6E63] mt-2">
              Agradecen su gentil asistencia
            </p>
            <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4"></div>
          </div>

          {/* Botones de Contacto Directo por WhatsApp */}
          <div className="mb-10 text-center">
            <p className="text-xs font-sans uppercase tracking-wider text-[#5C5247] font-semibold mb-4">
              ¿Prefieres confirmar por WhatsApp? Haz clic en una opción:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`https://wa.me/${WHATSAPP_BRIDE}?text=Hola%20Mariela,%20me%20gustaría%20confirmar%20mi%20asistencia%20a%20su%20boda.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans text-xs uppercase tracking-wider font-bold shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Contactar a la Novia
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_GROOM}?text=Hola%20Daniel,%20me%20gustaría%20confirmar%20mi%20asistencia%20a%20su%20boda.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans text-xs uppercase tracking-wider font-bold shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Contactar al Novio
              </a>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-8">
            <div className="flex-grow border-t border-[#E2D9CC]"></div>
            <span className="flex-shrink mx-4 text-xs font-sans uppercase tracking-widest text-[#7A6E63]">
              o envía el formulario
            </span>
            <div className="flex-grow border-t border-[#E2D9CC]"></div>
          </div>

          {rsvpSubmitted ? (
            <div className="bg-[#8F9E8B]/10 border border-[#8F9E8B]/30 rounded-2xl p-8 text-center animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-[#8F9E8B] mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-[#3A3228] mb-2">
                ¡Gracias por confirmar!
              </h3>
              <p className="text-sm font-sans text-[#7A6E63] mb-6">
                Hemos registrado tu respuesta correctamente. Nos llena de
                emoción compartir estos días de fiesta contigo.
              </p>
              <button
                onClick={() => setRsvpSubmitted(false)}
                className="text-xs font-sans uppercase tracking-wider text-[#8F9E8B] underline font-semibold"
              >
                Enviar otra respuesta
              </button>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-6 font-sans">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5C5247] font-semibold mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: María García"
                  value={rsvpData.fullName}
                  onChange={(e) =>
                    setRsvpData({ ...rsvpData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#E2D9CC] focus:outline-none focus:border-[#D4AF37] bg-[#FDFBF7] text-sm text-[#3A3228]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5C5247] font-semibold mb-2">
                  ¿Asistirás a nuestra boda? *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setRsvpData({ ...rsvpData, attending: "yes" })
                    }
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-xs tracking-wider transition-all ${
                      rsvpData.attending === "yes"
                        ? "bg-[#8F9E8B] text-white border-[#8F9E8B] shadow-sm"
                        : "bg-[#FDFBF7] text-[#5C5247] border-[#E2D9CC] hover:bg-[#F7F2EB]"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" /> ¡SÍ, ALLÍ ESTARÉ!
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRsvpData({ ...rsvpData, attending: "no" })
                    }
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-xs tracking-wider transition-all ${
                      rsvpData.attending === "no"
                        ? "bg-[#A86B6B] text-white border-[#A86B6B] shadow-sm"
                        : "bg-[#FDFBF7] text-[#5C5247] border-[#E2D9CC] hover:bg-[#F7F2EB]"
                    }`}
                  >
                    <UserX className="w-4 h-4" /> LO SIENTO, NO PUEDO
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5C5247] font-semibold mb-2">
                  Mensaje o Felicitaciones para los Novios
                </label>
                <textarea
                  rows="3"
                  placeholder="Escribe unas palabras cariñosas..."
                  value={rsvpData.message}
                  onChange={(e) =>
                    setRsvpData({ ...rsvpData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#E2D9CC] focus:outline-none focus:border-[#D4AF37] bg-[#FDFBF7] text-sm text-[#3A3228]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#C29F2F] text-white font-semibold text-xs uppercase tracking-widest shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Confirmar Asistencia
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Despedida & Agradecimiento */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#E2D9CC] shadow-sm max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-[#F7F2EB] text-[#D4AF37] shadow-inner">
            <Heart className="w-8 h-8 fill-[#D4AF37]/20" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] font-sans text-[#8F9E8B] font-bold block">
              Con Todo Nuestro Cariño
            </span>
            <h3 className="text-3xl md:text-4xl font-serif text-[#3A3228]">
              Agradecen su gentil asistencia
            </h3>
            <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-3"></div>
          </div>

          <div className="max-w-xl mx-auto space-y-4 font-serif text-[#5C5247] leading-relaxed text-sm md:text-base">
            <p>
              Para nosotros no hay mayor regalo que contar con tu presencia en
              este momento tan importante de nuestras vidas.
            </p>
            <p className="italic text-[#7A6E63] font-light">
              "El amor es el ingrediente que hace de la vida la mejor historia."
            </p>
          </div>

          <div className="pt-4">
            <p className="font-serif text-2xl text-[#D4AF37] tracking-wider">
              Daniel <span className="italic font-light">&amp;</span> Mariela
            </p>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#A89F91] mt-1">
              Potosí, Octubre del 2026
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#3A3228] text-[#E2D9CC] text-center font-serif border-t border-[#D4AF37]/30">
        <div className="max-w-xl mx-auto px-4 space-y-4">
          <p className="text-2xl tracking-widest text-[#D4AF37]">D &amp; M</p>
          <p className="text-xs font-sans tracking-widest uppercase text-[#A89F91]">
            Esperamos verte y celebrar juntos este nuevo capítulo
          </p>
          <div className="w-12 h-0.5 bg-[#D4AF37]/40 mx-auto"></div>
          <p className="text-[11px] font-sans text-[#A89F91]/70">
            Potosí, Octubre de 2026 • Hecho con todo el amor
          </p>
        </div>
      </footer>

      <audio ref={audioRef} src={musicaBoda} loop />
    </div>
  );
}
