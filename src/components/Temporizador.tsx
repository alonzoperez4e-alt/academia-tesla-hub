import { useEffect, useState } from "react";
import { getTimeUntilNextMonday, type TimeUntil } from "@/utils/timeHelper";

const Temporizador = () => {
  const [timeLeft, setTimeLeft] = useState<TimeUntil>(getTimeUntilNextMonday());

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeUntilNextMonday()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-3">
      {[{ label: "Días", value: timeLeft.days }, { label: "Horas", value: timeLeft.hours }, { label: "Min", value: timeLeft.minutes }, { label: "Seg", value: timeLeft.seconds }].map((item) => (
        <div
          key={item.label}
          className="bg-card border border-border rounded-2xl px-3.5 py-3 md:px-5 md:py-4 shadow-md min-w-[80px] md:min-w-[104px] text-center transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="font-mono font-extrabold text-2xl md:text-4xl text-primary leading-none drop-shadow-sm">{item.value}</div>
          <div className="text-[10px] md:text-sm text-muted-foreground mt-1 font-semibold tracking-wide">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default Temporizador;
