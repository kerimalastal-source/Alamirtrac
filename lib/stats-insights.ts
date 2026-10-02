// The statistics page's plain-Arabic summary: a few sentences that say what the
// numbers mean, so the owner doesn't have to read the tables to know how the
// site is doing. Pure functions over SiteStats.
import { cityAr, countryAr } from './arabic-places';
import { sourceLabel } from './attribution';
import { pageName } from './page-names';
import { ONLINE_MINUTES, type SiteStats } from './site-stats';

export type Insight = { icon: string; text: string; tone: 'good' | 'warn' | 'info' };

export const WEEKDAY_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** "9 مساءً", "12 ظهراً", "12 منتصف الليل". */
export function hourLabel(hour: number): string {
  if (hour === 0) return '12 منتصف الليل';
  if (hour === 12) return '12 ظهراً';
  return hour < 12 ? `${hour} صباحاً` : `${hour - 12} مساءً`;
}

/** "45 ثانية", "3 دقائق", "12 دقيقة" — whole units, never "0". */
export function durationLabel(seconds: number | null): string {
  if (seconds == null || seconds < 1) return '—';
  if (seconds < 60) return `${Math.round(seconds)} ثانية`;
  const minutes = Math.round(seconds / 60);
  if (minutes === 1) return 'دقيقة';
  if (minutes === 2) return 'دقيقتان';
  if (minutes <= 10) return `${minutes} دقائق`;
  return `${minutes} دقيقة`;
}

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const top = <T>(list: T[], value: (item: T) => number): T | undefined => list.reduce<T | undefined>((best, item) => (!best || value(item) > value(best) ? item : best), undefined);

/** How much `now` differs from `before`, as { percent, direction }, or null when there is nothing to compare with. */
export function change(now: number, before: number): { percent: number; direction: 'up' | 'down' | 'same' } | null {
  if (before <= 0) return null;
  const percent = Math.round(((now - before) / before) * 100);
  return { percent: Math.abs(percent), direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'same' };
}

export function buildInsights(stats: SiteStats): Insight[] {
  const out: Insight[] = [];
  const { visits } = stats;

  if (stats.onlineNow > 0) {
    out.push({
      icon: '🟢',
      text: stats.onlineNow === 1 ? `يوجد زائر واحد على الموقع الآن (خلال آخر ${ONLINE_MINUTES} دقائق).` : `يوجد ${stats.onlineNow} زوار على الموقع الآن (خلال آخر ${ONLINE_MINUTES} دقائق).`,
      tone: 'good',
    });
  }

  if (visits === 0) {
    out.push({ icon: '⏳', text: 'لم تُسجَّل زيارات في هذه الفترة بعد. جرّب فترة أطول من الأزرار أعلاه.', tone: 'info' });
    return out;
  }

  const c = change(visits, stats.previous.visits);
  if (c) {
    if (c.direction === 'up') out.push({ icon: '📈', text: `الزيارات ارتفعت ${c.percent}% عن الفترة السابقة (من ${stats.previous.visits} إلى ${visits}).`, tone: 'good' });
    else if (c.direction === 'down') out.push({ icon: '📉', text: `الزيارات انخفضت ${c.percent}% عن الفترة السابقة (من ${stats.previous.visits} إلى ${visits}).`, tone: 'warn' });
    else out.push({ icon: '➖', text: `عدد الزيارات ثابت مقارنة بالفترة السابقة (${visits}).`, tone: 'info' });
  }

  const country = top(stats.countries.filter((x) => x.country), (x) => x.visits);
  if (country) {
    const city = top(stats.cities.filter((x) => x.country === country.country), (x) => x.visits);
    out.push({
      icon: '🌍',
      text: `أكثر الزوار من ${countryAr(country.country)} (${pct(country.visits, visits)}%)${city ? `، وأكثر مدنها زيارةً ${cityAr(city.city)}` : ''}.`,
      tone: 'info',
    });
  }

  const source = top(stats.sources, (x) => x.visits);
  if (source && source.source !== 'unknown') {
    const label = source.medium === 'direct' ? 'الدخول المباشر (كتابة العنوان أو من المفضلة)' : sourceLabel({ source: source.source, medium: source.medium as never });
    out.push({ icon: '🧭', text: `أكبر مصدر للزيارات: ${label} بنسبة ${pct(source.visits, visits)}%.`, tone: 'info' });
  }

  const mobile = stats.devices.find((x) => x.device === 'mobile');
  if (mobile && visits >= 5) {
    const share = pct(mobile.visits, visits);
    out.push({ icon: '📱', text: share >= 50 ? `${share}% من زوارك يتصفحون من الجوال، فاحرص أن تكون الصفحات مريحة على الشاشة الصغيرة.` : `${share}% فقط من زوارك يتصفحون من الجوال.`, tone: 'info' });
  }

  if (visits >= 10) {
    const bestHour = top(stats.hours.map((n, hour) => ({ hour, n })), (x) => x.n);
    const bestDay = top(stats.weekdays.map((n, day) => ({ day, n })), (x) => x.n);
    if (bestHour && bestHour.n > 0 && bestDay && bestDay.n > 0) {
      out.push({ icon: '⏰', text: `ذروة الزيارات عادةً حوالي الساعة ${hourLabel(bestHour.hour)}، وأنشط الأيام ${WEEKDAY_AR[bestDay.day]} (بتوقيت القاهرة).`, tone: 'info' });
    }
  }

  const { bounceRate } = stats.engagement;
  if (visits >= 10) {
    if (bounceRate >= 0.7) out.push({ icon: '⚠️', text: `${Math.round(bounceRate * 100)}% من الزوار غادروا بعد صفحة واحدة. قد تحتاج الصفحة الأولى إلى رسالة أوضح أو زر تواصل أبرز.`, tone: 'warn' });
    else if (bounceRate <= 0.4) out.push({ icon: '👍', text: `معظم الزوار يتصفحون أكثر من صفحة (${Math.round((1 - bounceRate) * 100)}%)، وهذا مؤشر جيد على اهتمامهم.`, tone: 'good' });
  }

  const page = top(stats.pages, (x) => x.views);
  if (page && stats.pages.length > 1) out.push({ icon: '📄', text: `أكثر الصفحات مشاهدة: «${pageName(page.path)}».`, tone: 'info' });

  const { clicked, submitted } = stats.funnel;
  if (submitted > 0) out.push({ icon: '📝', text: submitted === 1 ? 'وصل طلب واحد عبر نموذج التواصل في هذه الفترة.' : `وصل ${submitted} طلبات عبر نموذج التواصل في هذه الفترة.`, tone: 'good' });
  if (clicked > 0) {
    const kind = top(stats.clicks.filter((x) => x.kind !== 'form'), (x) => x.clicks);
    const names: Record<string, string> = { whatsapp: 'واتساب', phone: 'الاتصال الهاتفي', email: 'البريد الإلكتروني', facebook: 'فيسبوك', instagram: 'إنستغرام' };
    out.push({ icon: '👆', text: `${clicked} ${clicked === 1 ? 'زائر نقر' : 'زائراً نقروا'} على وسيلة تواصل${kind ? `، وأكثرها ${names[kind.kind] ?? kind.kind}` : ''}.`, tone: 'good' });
  } else if (visits >= 20 && submitted === 0) {
    out.push({ icon: '💡', text: 'لم ينقر أحد على وسائل التواصل ولم يُرسل أحد نموذجاً رغم وجود زيارات؛ راجع وضوح أزرار الاتصال وواتساب.', tone: 'warn' });
  }

  return out;
}

const plural = (n: number, one: string, two: string, few: string, many: string) => (n === 1 ? one : n === 2 ? two : n <= 10 ? `${n} ${few}` : `${n} ${many}`);

/** "الآن", "قبل 3 دقائق", "قبل ساعتين"; null once it is a day old or more. */
export function agoLabel(iso: string, now = Date.now()): string | null {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `قبل ${plural(minutes, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `قبل ${plural(hours, 'ساعة', 'ساعتين', 'ساعات', 'ساعة')}`;
  return null;
}
