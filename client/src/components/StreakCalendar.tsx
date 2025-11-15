import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Flame } from "lucide-react";

interface StreakCalendarProps {
  checkinDates: string[]; // Array of YYYY-MM-DD date strings
  currentStreak: number;
}

export function StreakCalendar({ checkinDates, currentStreak }: StreakCalendarProps) {
  // Generate last 90 days
  const today = new Date();
  const days: { date: Date; dateString: string; hasCheckin: boolean; isToday: boolean }[] = [];
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const isToday = i === 0;
    const hasCheckin = checkinDates.includes(dateString);
    
    days.push({ date, dateString, hasCheckin, isToday });
  }

  // Group by weeks (7 days per row)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getMonthLabel = (date: Date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[date.getMonth()];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Streak Calendar
          <div className="flex items-center gap-1 ml-auto text-sm font-normal">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">{currentStreak} day streak</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Month labels */}
          <div className="flex gap-1 mb-2">
            {weeks.map((week, weekIdx) => {
              const firstDayOfWeek = week[0];
              const showMonthLabel = weekIdx === 0 || firstDayOfWeek.date.getDate() <= 7;
              return (
                <div key={weekIdx} className="flex-1 text-center">
                  {showMonthLabel && (
                    <span className="text-xs text-muted-foreground">
                      {getMonthLabel(firstDayOfWeek.date)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar grid - 7 days per week, stacked vertically */}
          <div className="space-y-1">
            {Array.from({ length: 7 }).map((_, dayOfWeek) => (
              <div key={dayOfWeek} className="flex gap-1">
                {weeks.map((week, weekIdx) => {
                  const day = week[dayOfWeek];
                  if (!day) return <div key={weekIdx} className="flex-1" />;
                  
                  return (
                    <div
                      key={weekIdx}
                      className={`
                        flex-1 aspect-square rounded-sm transition-colors
                        ${day.hasCheckin 
                          ? day.isToday 
                            ? 'bg-primary ring-2 ring-primary ring-offset-1' 
                            : 'bg-green-500 hover:bg-green-600'
                          : day.isToday
                            ? 'bg-muted ring-2 ring-muted-foreground ring-offset-1'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }
                      `}
                      title={`${day.dateString}${day.hasCheckin ? ' - Checked in!' : ''}`}
                      data-testid={`calendar-day-${day.dateString}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-muted/30" />
              <span>No check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span>Checked in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>Today</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
