// app/(tabs)/not-found-test.tsx
import { Redirect } from 'expo-router';

export default function NotFoundTest() {
  // Usar un tipo más específico para evitar el error de TypeScript
  return <Redirect href={"/ruta-inexistente-para-probar-404" as any} />;
}