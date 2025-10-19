import { Navigation } from "../Navigation";
import { ThemeProvider } from "../ThemeProvider";

export default function NavigationExample() {
  return (
    <ThemeProvider>
      <Navigation
        isLoggedIn={true}
        username="strongman42"
        isAdmin={false}
        userLevel={12}
        userXP={2450}
      />
    </ThemeProvider>
  );
}
