import type {
  AppointmentListQueryDto,
  AppointmentResponseDto,
  AppointmentTypeDto,
  DoctorResponseDto,
} from "@zdravstvo/contracts";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { APP_ROUTES } from "@/app/routes";
import { AppIcon } from "@/components";
import {
  useAppointmentsQuery,
  useAppointmentTypesQuery,
  useDoctorsQuery,
} from "@/hooks";
import { doctorsService } from "@/services";
import { getApiErrorMessage, toast } from "@/utils";

import "./appointments.css";

type AppointmentTone = "blue" | "teal" | "orange" | "red" | "gray";
type CalendarView = "day" | "week" | "month";
type FilterKey = "date" | "doctorId" | "appointmentTypeId" | "q" | "view";

interface DoctorColumn {
  id: string;
  name: string;
  specialty: string;
  initials: string;
  tone: AppointmentTone;
}

interface AppointmentLaneInfo {
  lane: number;
  laneCount: number;
}

interface CalendarAppointment {
  id: string;
  doctorId: string;
  patient: string;
  type: string;
  start: string;
  end: string;
  top: number;
  height: number;
  left: string;
  right: string;
  tone: AppointmentTone;
  selected?: boolean;
}

interface VisibleDateRange {
  start: Date;
  end: Date;
  startAt: string;
  endAt: string;
}

const DISPLAYED_DOCTOR_LIMIT = 4;
const CALENDAR_START_HOUR = 8;
const CALENDAR_END_HOUR = 18;
const HOUR_ROW_HEIGHT = 57;
const APPOINTMENT_LIMIT = 200;

const VIEW_OPTIONS: readonly { id: CalendarView; label: string }[] = [
  { id: "day", label: "Dan" },
  { id: "week", label: "Tjedan" },
  { id: "month", label: "Mjesec" },
];

const WEEKDAY_SHORT_LABELS = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

const hours = Array.from(
  { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
  (_, index) => `${String(CALENDAR_START_HOUR + index).padStart(2, "0")}:00`,
);

const formatTime = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const formatDateKey = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const formatLongDate = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatShortDate = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatMonthLabel = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatWeekdayLabel = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", { weekday: "long" }).format(date);

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const parseDateQuery = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : startOfLocalDay(date);
};

const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const addMonths = (date: Date, months: number): Date => {
  const targetMonthStart = new Date(
    date.getFullYear(),
    date.getMonth() + months,
    1,
  );
  const lastTargetMonthDay = new Date(
    targetMonthStart.getFullYear(),
    targetMonthStart.getMonth() + 1,
    0,
  ).getDate();

  targetMonthStart.setDate(Math.min(date.getDate(), lastTargetMonthDay));

  return targetMonthStart;
};

const startOfWeek = (date: Date): Date => {
  const dayStart = startOfLocalDay(date);
  const dayOfWeek = dayStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return addDays(dayStart, mondayOffset);
};

const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const getVisibleDateRange = (date: Date, view: CalendarView): VisibleDateRange => {
  const start =
    view === "week"
      ? startOfWeek(date)
      : view === "month"
        ? startOfMonth(date)
        : startOfLocalDay(date);
  const end =
    view === "week"
      ? addDays(start, 7)
      : view === "month"
        ? addMonths(start, 1)
        : addDays(start, 1);

  return {
    start,
    end,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
};

const parseViewQuery = (value: string | null): CalendarView => {
  if (value === "week" || value === "month") {
    return value;
  }

  return "day";
};

const getRangeLabel = (date: Date, view: CalendarView): string => {
  if (view === "week") {
    const range = getVisibleDateRange(date, view);
    const lastDay = addDays(range.end, -1);

    return `${formatShortDate(range.start)} - ${formatShortDate(lastDay)}`;
  }

  if (view === "month") {
    return formatMonthLabel(date);
  }

  return formatLongDate(date);
};

const getViewDescription = (view: CalendarView): string => {
  if (view === "week") {
    return "Tjedni prikaz";
  }

  if (view === "month") {
    return "Mjesečni prikaz";
  }

  return "Dnevni prikaz";
};

const getPreviousDateLabel = (view: CalendarView): string => {
  if (view === "week") {
    return "Prethodni tjedan";
  }

  if (view === "month") {
    return "Prethodni mjesec";
  }

  return "Prethodni dan";
};

const getNextDateLabel = (view: CalendarView): string => {
  if (view === "week") {
    return "Sljedeci tjedan";
  }

  if (view === "month") {
    return "Sljedeci mjesec";
  }

  return "Sljedeci dan";
};

const buildWeekDays = (date: Date): Date[] =>
  Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(date), index));

const buildMonthDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = addMonths(monthStart, 1);
  const gridStart = startOfWeek(monthStart);
  const lastMonthDay = addDays(monthEnd, -1);
  const gridEnd = addDays(startOfWeek(lastMonthDay), 7);
  const days: Date[] = [];

  for (let current = gridStart; current < gridEnd; current = addDays(current, 1)) {
    days.push(current);
  }

  return days;
};

const isSameLocalDay = (first: Date, second: Date): boolean =>
  formatDateKey(first) === formatDateKey(second);

const isSameLocalMonth = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth();

const groupAppointmentsByDate = (
  appointments: AppointmentResponseDto[],
): Map<string, AppointmentResponseDto[]> => {
  const appointmentsByDate = new Map<string, AppointmentResponseDto[]>();

  appointments.forEach((appointment) => {
    const dateKey = formatDateKey(new Date(appointment.startAt));
    const list = appointmentsByDate.get(dateKey) ?? [];
    list.push(appointment);
    appointmentsByDate.set(dateKey, list);
  });

  appointmentsByDate.forEach((list) => {
    list.sort(
      (first, second) =>
        new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
    );
  });

  return appointmentsByDate;
};

const getEmptyStateMessage = (
  view: CalendarView,
  hasActiveFilters: boolean,
): string => {
  if (hasActiveFilters) {
    return "Nema termina za odabrane filtere.";
  }

  if (view === "week") {
    return "Nema termina za odabrani tjedan.";
  }

  if (view === "month") {
    return "Nema termina za odabrani mjesec.";
  }

  return "Nema termina za odabrani dan.";
};

const getInitials = (firstName: string, lastName: string): string =>
  `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

const getDoctorName = (appointment: AppointmentResponseDto): string =>
  `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

const getDoctorOptionName = (doctor: DoctorResponseDto): string =>
  `Dr. ${doctor.firstName} ${doctor.lastName}`;

const getPatientName = (appointment: AppointmentResponseDto): string =>
  `${appointment.patient.firstName} ${appointment.patient.lastName}`;

const getAppointmentTone = (
  appointment: AppointmentResponseDto,
  index: number,
): AppointmentTone => {
  if (appointment.status === "CANCELLED" || appointment.status === "NO_SHOW") {
    return "red";
  }

  if (appointment.status === "COMPLETED") {
    return "gray";
  }

  const tones: AppointmentTone[] = ["teal", "blue", "orange"];
  return tones[index % tones.length] ?? "blue";
};

const getAppointmentTop = (startAt: Date): number => {
  const minutesFromStart =
    (startAt.getHours() - CALENDAR_START_HOUR) * 60 + startAt.getMinutes();
  const constrainedMinutes = Math.max(
    0,
    Math.min(minutesFromStart, (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60),
  );

  return 8 + (constrainedMinutes / 60) * HOUR_ROW_HEIGHT;
};

const getAppointmentDurationLabel = (
  appointment: AppointmentResponseDto,
): string => {
  const startAt = new Date(appointment.startAt);
  const endAt = new Date(appointment.endAt);
  const durationMinutes = Math.max(
    0,
    Math.round((endAt.getTime() - startAt.getTime()) / 60000),
  );

  return `${durationMinutes} min`;
};

const getAppointmentHeight = (startAt: Date, endAt: Date): number => {
  const durationMinutes = Math.max(
    0,
    Math.round((endAt.getTime() - startAt.getTime()) / 60000),
  );
  return Math.max(50, Math.floor((durationMinutes / 60) * HOUR_ROW_HEIGHT) - 2);
};

const computeLanes = (
  appointments: AppointmentResponseDto[],
): Map<string, AppointmentLaneInfo> => {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
  const laneEndTimes: number[] = [];
  const assigned = new Map<string, number>();

  for (const appt of sorted) {
    const startMs = new Date(appt.startAt).getTime();
    const endMs = new Date(appt.endAt).getTime();
    const available = laneEndTimes.findIndex((t) => t <= startMs);

    if (available === -1) {
      assigned.set(appt.id, laneEndTimes.length);
      laneEndTimes.push(endMs);
    } else {
      assigned.set(appt.id, available);
      laneEndTimes[available] = endMs;
    }
  }

  const totalLanes = Math.max(1, laneEndTimes.length);
  const result = new Map<string, AppointmentLaneInfo>();

  assigned.forEach((lane, id) => {
    result.set(id, { lane, laneCount: totalLanes });
  });

  return result;
};

const getLanePosition = (
  lane: number,
  laneCount: number,
): { left: string; right: string } => {
  if (laneCount <= 1) {
    return { left: "9px", right: "9px" };
  }
  const leftRatio = lane / laneCount;
  const rightRatio = (laneCount - 1 - lane) / laneCount;
  return {
    left:
      leftRatio > 0
        ? `calc(${(leftRatio * 100).toFixed(1)}% + 4px)`
        : "9px",
    right:
      rightRatio > 0
        ? `calc(${(rightRatio * 100).toFixed(1)}% + 4px)`
        : "9px",
  };
};

const mapDoctorOptionToColumn = (
  doctor: DoctorResponseDto,
  index: number,
): DoctorColumn => ({
  id: doctor.id,
  name: getDoctorOptionName(doctor),
  specialty: doctor.title ?? "Lijecnik",
  initials: getInitials(doctor.firstName, doctor.lastName),
  tone: index % 2 === 0 ? "orange" : "blue",
});

const buildDoctorColumns = (
  appointments: AppointmentResponseDto[],
  doctorOptions: DoctorResponseDto[],
  selectedDoctorId: string,
): DoctorColumn[] => {
  const doctorsById = new Map<string, DoctorColumn>();

  appointments.forEach((appointment, index) => {
    if (doctorsById.has(appointment.doctor.id)) {
      return;
    }

    doctorsById.set(appointment.doctor.id, {
      id: appointment.doctor.id,
      name: getDoctorName(appointment),
      specialty: appointment.doctor.title ?? "Lijecnik",
      initials: getInitials(
        appointment.doctor.firstName,
        appointment.doctor.lastName,
      ),
      tone: index % 2 === 0 ? "orange" : "blue",
    });
  });

  if (selectedDoctorId) {
    const selectedDoctor = doctorOptions.find(
      (doctor) => doctor.id === selectedDoctorId,
    );

    if (selectedDoctor && !doctorsById.has(selectedDoctor.id)) {
      doctorsById.set(
        selectedDoctor.id,
        mapDoctorOptionToColumn(selectedDoctor, 0),
      );
    }

    return Array.from(doctorsById.values()).filter(
      (doctor) => doctor.id === selectedDoctorId,
    );
  }

  if (doctorsById.size > 0) {
    return Array.from(doctorsById.values());
  }

  return doctorOptions
    .slice(0, DISPLAYED_DOCTOR_LIMIT)
    .map((doctor, index) => mapDoctorOptionToColumn(doctor, index));
};

const buildCalendarAppointments = (
  appointments: AppointmentResponseDto[],
  selectedAppointmentId: string | null,
): CalendarAppointment[] => {
  const byDoctor = new Map<string, AppointmentResponseDto[]>();

  appointments.forEach((appt) => {
    const list = byDoctor.get(appt.doctor.id) ?? [];
    list.push(appt);
    byDoctor.set(appt.doctor.id, list);
  });

  const allLanes = new Map<string, AppointmentLaneInfo>();

  byDoctor.forEach((doctorAppts) => {
    computeLanes(doctorAppts).forEach((info, id) => {
      allLanes.set(id, info);
    });
  });

  return appointments.map((appointment, index) => {
    const startAt = new Date(appointment.startAt);
    const endAt = new Date(appointment.endAt);
    const laneInfo = allLanes.get(appointment.id) ?? { lane: 0, laneCount: 1 };

    return {
      id: appointment.id,
      doctorId: appointment.doctor.id,
      patient: getPatientName(appointment),
      type: appointment.appointmentType.name,
      start: formatTime(startAt),
      end: formatTime(endAt),
      top: getAppointmentTop(startAt),
      height: getAppointmentHeight(startAt, endAt),
      ...getLanePosition(laneInfo.lane, laneInfo.laneCount),
      tone: getAppointmentTone(appointment, index),
      selected: appointment.id === selectedAppointmentId,
    };
  });
};

const buildFreeSlotSummaries = (
  appointments: AppointmentResponseDto[],
  doctors: DoctorColumn[],
): readonly (readonly [string, string, string])[] => {
  const byDoctor = new Map<string, AppointmentResponseDto[]>();

  appointments.forEach((appointment) => {
    const doctorAppointments = byDoctor.get(appointment.doctor.id) ?? [];
    doctorAppointments.push(appointment);
    byDoctor.set(appointment.doctor.id, doctorAppointments);
  });

  return doctors.slice(0, 4).map((doctor) => {
    const doctorAppointments = [...(byDoctor.get(doctor.id) ?? [])].sort(
      (first, second) =>
        new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
    );
    const lastAppointment = doctorAppointments.at(-1);

    if (!lastAppointment) {
      return [doctor.name, "08:00 - 18:00", "slobodno"] as const;
    }

    const lastEnd = formatTime(new Date(lastAppointment.endAt));
    return [doctor.name, `${lastEnd} - 18:00`, "slobodno"] as const;
  });
};

const getErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Termini se trenutno ne mogu ucitati.";
};

function AppointmentsPage(): ReactElement {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const doctorComboboxRef = useRef<HTMLDivElement | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [doctorComboboxValue, setDoctorComboboxValue] = useState("");
  const [isDoctorComboboxOpen, setIsDoctorComboboxOpen] = useState(false);
  const [isBlockTimeFormOpen, setIsBlockTimeFormOpen] = useState(false);
  const [blockTimeDoctorId, setBlockTimeDoctorId] = useState("");
  const [blockTimeDate, setBlockTimeDate] = useState("");
  const [blockTimeStart, setBlockTimeStart] = useState("08:00");
  const [blockTimeEnd, setBlockTimeEnd] = useState("08:30");
  const [blockTimeReason, setBlockTimeReason] = useState("Blokirano vrijeme");
  const [blockTimeError, setBlockTimeError] = useState<string | null>(null);
  const [isBlockingTime, setIsBlockingTime] = useState(false);

  const selectedDate = useMemo(
    () =>
      parseDateQuery(searchParams.get("date")) ?? startOfLocalDay(new Date()),
    [searchParams],
  );
  const selectedView = parseViewQuery(searchParams.get("view"));
  const selectedDoctorId = searchParams.get("doctorId") ?? "";
  const selectedAppointmentTypeId = searchParams.get("appointmentTypeId") ?? "";
  const searchTerm = searchParams.get("q") ?? "";
  const hasActiveFilters = Boolean(
    selectedDoctorId || selectedAppointmentTypeId || searchTerm.trim(),
  );

  const visibleRange = useMemo(
    () => getVisibleDateRange(selectedDate, selectedView),
    [selectedDate, selectedView],
  );
  const appointmentsQuery = useMemo<AppointmentListQueryDto>(() => {
    const query: AppointmentListQueryDto = {
      startAt: visibleRange.startAt,
      endAt: visibleRange.endAt,
      limit: APPOINTMENT_LIMIT,
    };
    const normalizedSearchTerm = searchTerm.trim();

    if (selectedDoctorId) {
      query.doctorId = selectedDoctorId;
    }

    if (selectedAppointmentTypeId) {
      query.appointmentTypeId = selectedAppointmentTypeId;
    }

    if (normalizedSearchTerm) {
      query.search = normalizedSearchTerm;
    }

    return query;
  }, [visibleRange, searchTerm, selectedAppointmentTypeId, selectedDoctorId]);

  const {
    data: appointmentsResponse,
    error: appointmentsError,
    isLoading: areAppointmentsLoading,
  } = useAppointmentsQuery(appointmentsQuery);
  const appointmentsData = appointmentsResponse?.appointments ?? [];
  const {
    data: doctorsData,
    error: doctorsError,
    isLoading: areDoctorsLoading,
  } = useDoctorsQuery();
  const {
    data: appointmentTypesData,
    error: appointmentTypesError,
    isLoading: areAppointmentTypesLoading,
  } = useAppointmentTypesQuery();

  const doctorOptions: DoctorResponseDto[] = doctorsData ?? [];
  const appointmentTypeOptions: AppointmentTypeDto[] =
    appointmentTypesData ?? [];
  const selectedDoctorOption =
    doctorOptions.find((doctor) => doctor.id === selectedDoctorId) ?? null;
  const selectedDoctorLabel = selectedDoctorOption
    ? getDoctorOptionName(selectedDoctorOption)
    : "";
  const normalizedDoctorComboboxValue = doctorComboboxValue
    .trim()
    .toLocaleLowerCase("hr-HR");
  const filteredDoctorOptions = useMemo(() => {
    if (!normalizedDoctorComboboxValue) {
      return doctorOptions;
    }

    return doctorOptions.filter((doctor) =>
      getDoctorOptionName(doctor)
        .toLocaleLowerCase("hr-HR")
        .includes(normalizedDoctorComboboxValue),
    );
  }, [doctorOptions, normalizedDoctorComboboxValue]);
  const showAllDoctorsOption =
    !normalizedDoctorComboboxValue ||
    "svi lijecnici".includes(normalizedDoctorComboboxValue);

  const appointments = useMemo(
    () =>
      [...appointmentsData].sort(
        (first, second) =>
          new Date(first.startAt).getTime() -
          new Date(second.startAt).getTime(),
      ),
    [appointmentsData],
  );
  const appointmentsByDate = useMemo(
    () => groupAppointmentsByDate(appointments),
    [appointments],
  );
  const selectedDayAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        isSameLocalDay(new Date(appointment.startAt), selectedDate),
      ),
    [appointments, selectedDate],
  );
  const weekDays = useMemo(() => buildWeekDays(selectedDate), [selectedDate]);
  const monthDays = useMemo(() => buildMonthDays(selectedDate), [selectedDate]);
  const doctors = useMemo(
    () =>
      buildDoctorColumns(
        selectedDayAppointments,
        doctorOptions,
        selectedDoctorId,
      ),
    [doctorOptions, selectedDayAppointments, selectedDoctorId],
  );
  const calendarAppointments = useMemo(
    () =>
      buildCalendarAppointments(
        selectedDayAppointments.filter((appointment) =>
          doctors.some((doctor) => doctor.id === appointment.doctor.id),
        ),
        selectedAppointmentId,
      ),
    [doctors, selectedAppointmentId, selectedDayAppointments],
  );
  const selectedAppointment = selectedAppointmentId
    ? appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null
    : null;
  const freeSlots = useMemo(
    () => buildFreeSlotSummaries(selectedDayAppointments, doctors),
    [doctors, selectedDayAppointments],
  );
  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => new Date(appointment.startAt) >= new Date())
        .slice(0, 3),
    [appointments],
  );
  const currentRangeLabel = getRangeLabel(selectedDate, selectedView);
  const currentViewDescription = getViewDescription(selectedView);
  const emptyStateMessage = getEmptyStateMessage(
    selectedView,
    hasActiveFilters,
  );
  const error = getErrorMessage(
    appointmentsError ?? doctorsError ?? appointmentTypesError,
  );

  useEffect(() => {
    setSelectedAppointmentId((currentAppointmentId) =>
      appointments.some((appointment) => appointment.id === currentAppointmentId)
        ? currentAppointmentId
        : null,
    );
  }, [appointments]);

  useEffect(() => {
    if (!isDoctorComboboxOpen) {
      setDoctorComboboxValue(selectedDoctorLabel);
    }
  }, [isDoctorComboboxOpen, selectedDoctorLabel]);

  useEffect(() => {
    const closeDoctorCombobox = (event: MouseEvent): void => {
      if (
        doctorComboboxRef.current &&
        !doctorComboboxRef.current.contains(event.target as Node)
      ) {
        setIsDoctorComboboxOpen(false);
        setDoctorComboboxValue(selectedDoctorLabel);
      }
    };

    document.addEventListener("mousedown", closeDoctorCombobox);

    return () => {
      document.removeEventListener("mousedown", closeDoctorCombobox);
    };
  }, [selectedDoctorLabel]);

  const updateFilters = (updates: Partial<Record<FilterKey, string>>): void => {
    const nextParams = new URLSearchParams(searchParams);

    (Object.entries(updates) as [FilterKey, string][]).forEach(
      ([key, value]) => {
        const normalizedValue = key === "q" ? value : value.trim();

        if (normalizedValue.trim()) {
          nextParams.set(key, normalizedValue);
          return;
        }

        nextParams.delete(key);
      },
    );

    setSearchParams(nextParams);
    setSelectedAppointmentId(null);
  };

  const changeDate = (direction: -1 | 1): void => {
    const nextDate =
      selectedView === "month"
        ? addMonths(selectedDate, direction)
        : addDays(selectedDate, selectedView === "week" ? direction * 7 : direction);

    updateFilters({ date: formatDateKey(startOfLocalDay(nextDate)) });
  };

  const changeView = (view: CalendarView): void => {
    updateFilters({ view: view === "day" ? "" : view });
  };

  const useToday = (): void => {
    updateFilters({ date: formatDateKey(new Date()) });
  };

  const clearFilters = (): void => {
    updateFilters({ doctorId: "", appointmentTypeId: "", q: "" });
  };

  const selectDoctorFilter = (doctorId: string, label: string): void => {
    updateFilters({ doctorId });
    setDoctorComboboxValue(label);
    setIsDoctorComboboxOpen(false);
  };

  const handleDoctorComboboxChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = event.target.value;

    setDoctorComboboxValue(value);
    setIsDoctorComboboxOpen(true);

    if (!value.trim() || (selectedDoctorLabel && value !== selectedDoctorLabel)) {
      updateFilters({ doctorId: "" });
    }
  };

  const handleDoctorComboboxKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Escape") {
      setIsDoctorComboboxOpen(false);
      setDoctorComboboxValue(selectedDoctorLabel);
      return;
    }

    if (event.key !== "Enter" || !isDoctorComboboxOpen) {
      return;
    }

    event.preventDefault();

    if (!doctorComboboxValue.trim()) {
      selectDoctorFilter("", "");
      return;
    }

    const exactMatch = filteredDoctorOptions.find(
      (doctor) =>
        getDoctorOptionName(doctor).toLocaleLowerCase("hr-HR") ===
        normalizedDoctorComboboxValue,
    );
    const doctorToSelect = exactMatch ?? filteredDoctorOptions[0];

    if (doctorToSelect) {
      selectDoctorFilter(doctorToSelect.id, getDoctorOptionName(doctorToSelect));
    }
  };

  const openBlockTimeForm = (): void => {
    setBlockTimeDoctorId(selectedDoctorId || doctorOptions[0]?.id || "");
    setBlockTimeDate(formatDateKey(selectedDate));
    setBlockTimeStart("08:00");
    setBlockTimeEnd("08:30");
    setBlockTimeReason("Blokirano vrijeme");
    setBlockTimeError(null);
    setIsBlockTimeFormOpen(true);
  };

  const closeBlockTimeForm = (): void => {
    setIsBlockTimeFormOpen(false);
    setBlockTimeError(null);
  };

  const handleBlockTime = async (): Promise<void> => {
    if (!blockTimeDoctorId || !blockTimeDate || !blockTimeStart || !blockTimeEnd) {
      setBlockTimeError("Odaberite liječnika, datum te početak i kraj blokade.");
      return;
    }

    const startAt = new Date(`${blockTimeDate}T${blockTimeStart}:00`);
    const endAt = new Date(`${blockTimeDate}T${blockTimeEnd}:00`);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      setBlockTimeError("Vrijeme blokade nije ispravno.");
      return;
    }

    if (startAt >= endAt) {
      setBlockTimeError("Vrijeme završetka mora biti nakon početka.");
      return;
    }

    try {
      setIsBlockingTime(true);
      setBlockTimeError(null);
      await doctorsService.createTimeOff(blockTimeDoctorId, {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        reason: blockTimeReason.trim() || "Blokirano vrijeme",
      });
      toast.success("Vrijeme je blokirano bez pacijenta.");
      closeBlockTimeForm();
    } catch (blockError) {
      setBlockTimeError(getApiErrorMessage(blockError));
      toast.error(blockError);
    } finally {
      setIsBlockingTime(false);
    }
  };

  return (
    <div className="appointments-page">
      <div className="appointments-page__hero">
        <div>
          <h1>Termini</h1>
          <p>Pregled dnevnog rasporeda i upravljanje terminima.</p>
        </div>
        <Link className="appointments-primary-button" to="/appointments/create">
          <AppIcon name="plus" />
          Novi termin
        </Link>
      </div>

      {error ? (
        <section className="appointments-side-panel" role="alert">
          <h2>Termini nisu dostupni</h2>
          <p>{error}</p>
        </section>
      ) : null}

      <section className="appointments-filters" aria-label="Filteri termina">
        <label>
          <span>Datum</span>
          <div>
            <AppIcon name="calendar" />
            <input
              aria-label="Datum termina"
              type="date"
              value={formatDateKey(selectedDate)}
              onChange={(event) => updateFilters({ date: event.target.value })}
            />
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Lijecnik</span>
          <div className="appointments-combobox" ref={doctorComboboxRef}>
            <AppIcon name="user" />
            <input
              aria-label="Lijecnik"
              aria-autocomplete="list"
              aria-controls="appointments-doctor-combobox-list"
              aria-expanded={isDoctorComboboxOpen}
              disabled={areDoctorsLoading}
              placeholder="Svi lijecnici"
              role="combobox"
              type="text"
              value={doctorComboboxValue}
              onChange={handleDoctorComboboxChange}
              onFocus={() => setIsDoctorComboboxOpen(true)}
              onKeyDown={handleDoctorComboboxKeyDown}
            />
            <button
              aria-label="Prikazi lijecnike"
              className="appointments-combobox__toggle"
              disabled={areDoctorsLoading}
              type="button"
              onClick={() =>
                setIsDoctorComboboxOpen((currentValue) => !currentValue)
              }
            >
              <AppIcon name="chevronDown" />
            </button>
            {isDoctorComboboxOpen ? (
              <ul
                className="appointments-combobox__list"
                id="appointments-doctor-combobox-list"
                role="listbox"
              >
                {showAllDoctorsOption ? (
                  <li
                    className={!selectedDoctorId ? "is-active" : undefined}
                    role="option"
                    aria-selected={!selectedDoctorId}
                    onMouseDown={() => selectDoctorFilter("", "")}
                  >
                    Svi lijecnici
                  </li>
                ) : null}
                {filteredDoctorOptions.map((doctor) => {
                  const doctorName = getDoctorOptionName(doctor);

                  return (
                    <li
                      className={
                        doctor.id === selectedDoctorId ? "is-active" : undefined
                      }
                      key={doctor.id}
                      role="option"
                      aria-selected={doctor.id === selectedDoctorId}
                      onMouseDown={() => selectDoctorFilter(doctor.id, doctorName)}
                    >
                      {doctorName}
                    </li>
                  );
                })}
                {!filteredDoctorOptions.length && !showAllDoctorsOption ? (
                  <li className="appointments-combobox__empty">
                    Nema pronadenih lijecnika
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </label>
        <label>
          <span>Vrsta termina</span>
          <div>
            <AppIcon name="tag" />
            <select
              aria-label="Vrsta termina"
              disabled={areAppointmentTypesLoading}
              value={selectedAppointmentTypeId}
              onChange={(event) =>
                updateFilters({ appointmentTypeId: event.target.value })
              }
            >
              <option value="">Sve vrste</option>
              {appointmentTypeOptions.map((appointmentType) => (
                <option key={appointmentType.id} value={appointmentType.id}>
                  {appointmentType.name}
                </option>
              ))}
            </select>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label className="appointments-search-field">
          <span>Pretraga</span>
          <div>
            <AppIcon name="search" />
            <input
              type="search"
              placeholder="Pretrazite pacijente, lijecnike, termine..."
              value={searchTerm}
              onChange={(event) => updateFilters({ q: event.target.value })}
            />
          </div>
        </label>
      </section>

      <div className="appointments-content-grid">
        <section
          className="appointments-calendar-panel"
          aria-label={currentViewDescription}
        >
          <div className="appointments-calendar-toolbar">
            <div className="appointments-date-controls">
              <button
                type="button"
                aria-label={getPreviousDateLabel(selectedView)}
                onClick={() => changeDate(-1)}
              >
                <AppIcon name="chevronLeft" />
              </button>
              <button type="button" onClick={useToday}>
                Danas
              </button>
              <button
                type="button"
                aria-label={getNextDateLabel(selectedView)}
                onClick={() => changeDate(1)}
              >
                <AppIcon name="chevronRight" />
              </button>
            </div>

            <div className="appointments-current-day" aria-live="polite">
              <span>
                <strong>{currentRangeLabel}</strong>
                <small>{currentViewDescription}</small>
              </span>
              <AppIcon name="calendar" />
            </div>

            <div className="appointments-view-switcher" aria-label="Prikaz">
              {VIEW_OPTIONS.map((viewOption) => (
                <button
                  className={
                    selectedView === viewOption.id
                      ? "appointments-view-switcher__active"
                      : undefined
                  }
                  type="button"
                  aria-pressed={selectedView === viewOption.id}
                  key={viewOption.id}
                  onClick={() => changeView(viewOption.id)}
                >
                  {viewOption.label}
                </button>
              ))}
            </div>
          </div>

          {selectedView === "day" ? (
            <div
              className="appointments-calendar-scroll"
              aria-label="Dnevni raspored termina"
            >
              <div
                className="appointments-calendar"
                style={{
                  gridTemplateColumns: `76px repeat(${Math.max(
                    doctors.length,
                    1,
                  )}, minmax(220px, 1fr))`,
                }}
              >
                <div className="appointments-calendar__header-spacer" />
                {doctors.map((doctor) => (
                  <div className="appointments-doctor-heading" key={doctor.id}>
                    <span
                      className={`appointments-avatar appointments-avatar--${doctor.tone}`}
                    >
                      {doctor.initials}
                    </span>
                    <div>
                      <strong>{doctor.name}</strong>
                      <small>{doctor.specialty}</small>
                    </div>
                  </div>
                ))}

                <div className="appointments-calendar__times">
                  {hours.map((hour) => (
                    <span key={hour}>{hour}</span>
                  ))}
                </div>

                {doctors.map((doctor) => (
                  <div className="appointments-doctor-column" key={doctor.id}>
                    <div className="appointments-hour-lines">
                      {hours.map((hour) => (
                        <span key={hour} />
                      ))}
                    </div>
                    {calendarAppointments
                      .filter(
                        (appointment) => appointment.doctorId === doctor.id,
                      )
                      .map((appointment) => (
                        <Link
                          className={[
                            "appointment-card",
                            `appointment-card--${appointment.tone}`,
                            appointment.selected
                              ? "appointment-card--selected"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          key={appointment.id}
                          style={{
                            top: `${appointment.top}px`,
                            height: `${appointment.height}px`,
                            left: appointment.left,
                            right: appointment.right,
                          }}
                          to={`/appointments/${appointment.id}`}
                          onMouseEnter={() =>
                            setSelectedAppointmentId(appointment.id)
                          }
                        >
                          <span>
                            {appointment.start} - {appointment.end}
                          </span>
                          <strong>{appointment.patient}</strong>
                          <small>{appointment.type}</small>
                          {appointment.selected ? (
                            <AppIcon name="chevronRight" />
                          ) : null}
                        </Link>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedView === "week" ? (
            <div
              className="appointments-agenda appointments-agenda--week"
              aria-label="Tjedni raspored termina"
            >
              {weekDays.map((day) => {
                const dayAppointments =
                  appointmentsByDate.get(formatDateKey(day)) ?? [];

                return (
                  <section
                    className={[
                      "appointments-agenda-day",
                      isSameLocalDay(day, selectedDate)
                        ? "appointments-agenda-day--selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={formatDateKey(day)}
                  >
                    <header>
                      <strong>{formatWeekdayLabel(day)}</strong>
                      <span>{formatShortDate(day)}</span>
                      <em>{dayAppointments.length} termina</em>
                    </header>

                    <div className="appointments-agenda-list">
                      {dayAppointments.length > 0 ? (
                        dayAppointments.map((appointment, index) => {
                          const tone = getAppointmentTone(appointment, index);
                          const isSelected =
                            appointment.id === selectedAppointmentId;

                          return (
                            <Link
                              className={[
                                "appointments-agenda-card",
                                `appointments-agenda-card--${tone}`,
                                isSelected
                                  ? "appointments-agenda-card--selected"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              key={appointment.id}
                              to={`/appointments/${appointment.id}`}
                              onMouseEnter={() =>
                                setSelectedAppointmentId(appointment.id)
                              }
                            >
                              <time>
                                {formatTime(new Date(appointment.startAt))} -{" "}
                                {formatTime(new Date(appointment.endAt))}
                              </time>
                              <strong>{getPatientName(appointment)}</strong>
                              <small>
                                {getDoctorName(appointment)} ·{" "}
                                {appointment.appointmentType.name}
                              </small>
                            </Link>
                          );
                        })
                      ) : (
                        <p className="appointments-agenda-empty">Nema termina</p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : null}

          {selectedView === "month" ? (
            <div
              className="appointments-month-grid"
              aria-label="Mjesečni raspored termina"
            >
              {WEEKDAY_SHORT_LABELS.map((weekday) => (
                <span className="appointments-month-weekday" key={weekday}>
                  {weekday}
                </span>
              ))}

              {monthDays.map((day) => {
                const dayAppointments =
                  appointmentsByDate.get(formatDateKey(day)) ?? [];

                return (
                  <section
                    className={[
                      "appointments-month-day",
                      isSameLocalMonth(day, selectedDate) ? "" : "is-muted",
                      isSameLocalDay(day, selectedDate) ? "is-selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={formatDateKey(day)}
                  >
                    <header>
                      <strong>{day.getDate()}</strong>
                      <em>{dayAppointments.length}</em>
                    </header>

                    <div className="appointments-month-list">
                      {dayAppointments.slice(0, 3).map((appointment, index) => {
                        const tone = getAppointmentTone(appointment, index);

                        return (
                          <Link
                            className={[
                              "appointments-month-card",
                              `appointments-month-card--${tone}`,
                              appointment.id === selectedAppointmentId
                                ? "appointments-month-card--selected"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            key={appointment.id}
                            to={`/appointments/${appointment.id}`}
                            onMouseEnter={() =>
                              setSelectedAppointmentId(appointment.id)
                            }
                          >
                            <time>{formatTime(new Date(appointment.startAt))}</time>
                            <span>{getPatientName(appointment)}</span>
                          </Link>
                        );
                      })}

                      {dayAppointments.length > 3 ? (
                        <small>+{dayAppointments.length - 3} još</small>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : null}

          {areAppointmentsLoading ? (
            <div className="appointments-legend">
              <span>Ucitavanje termina iz baze...</span>
            </div>
          ) : null}

          {!areAppointmentsLoading && appointments.length === 0 ? (
            <div className="appointments-legend">
              <span>{emptyStateMessage}</span>
            </div>
          ) : null}

          <div className="appointments-legend">
            <span>
              <i className="appointments-dot appointments-dot--blue" />
              Zakazano
            </span>
            <span>
              <i className="appointments-dot appointments-dot--teal" />
              Aktivno
            </span>
            <span>
              <i className="appointments-dot appointments-dot--orange" />U
              rasporedu
            </span>
            <span>
              <i className="appointments-dot appointments-dot--red" />
              Otkazano / nedolazak
            </span>
            <span>
              <i className="appointments-dot appointments-dot--gray" />
              Zavrseno
            </span>
            {hasActiveFilters ? (
              <button
                className="appointments-clear-filter-button"
                type="button"
                onClick={clearFilters}
              >
                Ocisti filtere
              </button>
            ) : null}
          </div>
        </section>

        <aside className="appointments-side-stack" aria-label="Sazetak termina">
          <section className="appointments-side-panel">
            <h2>Slobodni termini</h2>
            <p>{formatShortDate(selectedDate)}</p>
            <div className="appointments-free-list">
              {freeSlots.length > 0 ? (
                freeSlots.map(([name, time, badge]) => (
                  <div key={name}>
                    <span>
                      <strong>{name}</strong>
                      <small>{time}</small>
                    </span>
                    <em>{badge}</em>
                  </div>
                ))
              ) : (
                <div>
                  <span>
                    <strong>Nema podataka</strong>
                    <small>Za odabrani dan nema prikazanih lijecnika.</small>
                  </span>
                </div>
              )}
            </div>
            <button className="appointments-link-button" type="button" onClick={() => navigate('/appointments/create')}>
              Pogledaj sve slobodne termine
              <AppIcon name="chevronRight" />
            </button>
          </section>

          <section className="appointments-side-panel">
            <h2>Podsjetnici</h2>
            <p>{upcomingAppointments.length} nadolazeca termina</p>
            <div className="appointments-reminders">
              {upcomingAppointments.map((appointment, index) => (
                <div
                  className={`appointments-reminder appointments-reminder--${
                    index % 2 === 0 ? "orange" : "teal"
                  }`}
                  key={appointment.id}
                >
                  <AppIcon name="bell" />
                  <span>
                    <strong>{getPatientName(appointment)}</strong>
                    <small>{appointment.appointmentType.name}</small>
                  </span>
                  <time>{formatShortDate(new Date(appointment.startAt))}</time>
                </div>
              ))}
            </div>
            <button className="appointments-link-button" type="button" onClick={() => navigate(APP_ROUTES.notifications)}>
              Pogledaj sve podsjetnike
              <AppIcon name="chevronRight" />
            </button>
          </section>

          {selectedAppointment ? (
            <section className="appointments-selected-panel">
              <div className="appointments-selected-heading">
                <h2>Detalji odabranog termina</h2>
                <button
                  className="appointments-selected-close"
                  type="button"
                  aria-label="Zatvori detalje termina"
                  onClick={() => setSelectedAppointmentId(null)}
                >
                  <AppIcon name="xCircle" />
                </button>
              </div>
              <div className="appointments-selected-card">
                <span className="appointments-selected-icon">
                  <AppIcon name="calendar" />
                </span>
                <div>
                  <strong>{getPatientName(selectedAppointment)}</strong>
                  <small>{selectedAppointment.appointmentType.name}</small>
                  <small>{getDurationLabel(selectedAppointment)}</small>
                </div>
                <div>
                  <time>
                    {formatTime(new Date(selectedAppointment.startAt))} -{" "}
                    {formatTime(new Date(selectedAppointment.endAt))}
                  </time>
                  <small>{getDoctorName(selectedAppointment)}</small>
                </div>
              </div>
              <Link to={`/appointments/${selectedAppointment.id}`}>
                Pogledaj detalje termina
                <AppIcon name="chevronRight" />
              </Link>
            </section>
          ) : null}

          <section className="appointments-side-panel appointments-quick-actions-panel">
            <h2>Brze akcije</h2>
            <div className="appointments-quick-actions">
              <Link to="/appointments/create">
                <AppIcon name="calendar" />
                Novi termin
              </Link>
              <button type="button" onClick={openBlockTimeForm}>
                <AppIcon name="shield" />
                Blokiraj vrijeme
              </button>
              <button type="button" onClick={() => window.print()}>
                <AppIcon name="note" />
                Ispisi raspored
              </button>
              <button
                type="button"
                onClick={() => {
                  const rows = [
                    ['Pacijent', 'Lijecnik', 'Pocetek', 'Kraj', 'Vrsta'].join(','),
                    ...appointmentsData.map((a) =>
                      [
                        `${a.patient.firstName} ${a.patient.lastName}`,
                        `${a.doctor.firstName} ${a.doctor.lastName}`,
                        a.startAt,
                        a.endAt,
                        a.appointmentType.name,
                      ]
                        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                        .join(','),
                    ),
                  ].join('\n');
                  const blob = new Blob([rows], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `raspored-${formatDateKey(selectedDate)}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <AppIcon name="send" />
                Izvezi raspored
              </button>
            </div>
          </section>

          {isBlockTimeFormOpen ? (
            <section className="appointments-side-panel appointments-block-time-panel">
              <div className="appointments-panel-heading">
                <h2>Blokiraj vrijeme</h2>
                <button
                  className="appointments-selected-close"
                  type="button"
                  aria-label="Zatvori blokiranje vremena"
                  onClick={closeBlockTimeForm}
                >
                  <AppIcon name="xCircle" />
                </button>
              </div>
              <p>Unesite zauzeće liječnika bez povezivanja s pacijentom.</p>

              {blockTimeError ? (
                <div className="appointments-block-time-error" role="alert">
                  {blockTimeError}
                </div>
              ) : null}

              <div className="appointments-block-time-form">
                <label>
                  <span>Liječnik</span>
                  <select
                    value={blockTimeDoctorId}
                    onChange={(event) => setBlockTimeDoctorId(event.target.value)}
                  >
                    <option value="">Odaberite liječnika</option>
                    {doctorOptions.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {getDoctorOptionName(doctor)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Datum</span>
                  <input
                    type="date"
                    value={blockTimeDate}
                    onChange={(event) => setBlockTimeDate(event.target.value)}
                  />
                </label>
                <div className="appointments-block-time-row">
                  <label>
                    <span>Početak</span>
                    <input
                      type="time"
                      value={blockTimeStart}
                      onChange={(event) => setBlockTimeStart(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Kraj</span>
                    <input
                      type="time"
                      value={blockTimeEnd}
                      onChange={(event) => setBlockTimeEnd(event.target.value)}
                    />
                  </label>
                </div>
                <label>
                  <span>Razlog</span>
                  <input
                    type="text"
                    value={blockTimeReason}
                    onChange={(event) => setBlockTimeReason(event.target.value)}
                  />
                </label>
              </div>

              <div className="appointments-block-time-actions">
                <button type="button" onClick={closeBlockTimeForm}>
                  Odustani
                </button>
                <button
                  type="button"
                  disabled={isBlockingTime}
                  onClick={() => void handleBlockTime()}
                >
                  {isBlockingTime ? "Spremanje..." : "Spremi blokadu"}
                </button>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

const getDurationLabel = getAppointmentDurationLabel;

export { AppointmentsPage };
