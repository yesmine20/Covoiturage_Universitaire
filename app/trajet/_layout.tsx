import { DarkTheme, DefaultTheme, ThemeProvider } 
  from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Tabs from './(tabs)/acceuil';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider 
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <Stack>
        {/* Tabs principales */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />

        {/* Auth */}
        <Stack.Screen 
          name="(auth)/login" 
          options={{ 
            headerShown: false,
            title: 'Connexion' 
          }} 
        />
        <Stack.Screen 
          name="(auth)/register" 
          options={{ 
            headerShown: false,
            title: 'Inscription' 
          }} 
        />
        <Stack.Screen
          name="(auth)/reset-password"
          options={{
            headerShown: false,
            title: 'Nouveau mot de passe'
          }}
        />

        {/* Détail trajet */}
        <Stack.Screen 
          name="trajet/[id]" 
          options={{ 
            title: 'Détail du trajet',
            headerBackTitle: 'Retour'
          }} 
        />

        {/* Réservation */}
        <Stack.Screen 
          name="reservation/index" 
          options={{ 
            title: 'Réserver une place',
            headerBackTitle: 'Retour'
          }} 
        />

        {/* Modal */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            title: 'Modal' 
          }} 
        />
      </Stack>
      </ThemeProvider>
  );
}
