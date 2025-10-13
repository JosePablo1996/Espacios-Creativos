import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, Dimensions, Animated, Easing, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { AlertTriangle, Home, Zap, Sparkles, Satellite, Rocket, Globe, Circle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function NotFoundScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Valor separado para animaciones que necesitan useNativeDriver: false (como el brillo de opacity)
  const glowAnimNativeFalse = useRef(new Animated.Value(0)).current;

  // Lógica de pantalla responsive
  const isLargeScreen = width >= 1024;
  
  useEffect(() => {
    // Animación de entrada
    let animations: Animated.CompositeAnimation[] = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];
    
    // Solo aplica la animación de escala grande en escritorio
    if (isLargeScreen) {
        animations.push(
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        );
    } else {
        // En móviles/tabletas, establece la escala a 1 inmediatamente después de la animación de entrada
        scaleAnim.setValue(1);
    }


    Animated.parallel(animations).start();

    // Animación de brillo intermitente (usa useNativeDriver: false)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimNativeFalse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimNativeFalse, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Animación de rotación para los elementos (usa useNativeDriver: true)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animación de flotación (usa useNativeDriver: true)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de pulso para el botón (usa useNativeDriver: true)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interpolaciones para transform (useNativeDriver: true)
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  // Aplica la escala solo si no es un móvil/tablet
  const animatedScale = isLargeScreen ? scaleAnim : new Animated.Value(1);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  // Interpolaciones para opacity (useNativeDriver: false)
  const glowOpacity = glowAnimNativeFalse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });


  return (
    <>
      <Stack.Screen options={{ 
        title: '¡Ups! Página No Encontrada',
        headerStyle: {
          backgroundColor: '#0A0A0A',
        },
        headerTintColor: '#00FF87',
        headerTitleStyle: {
          fontWeight: '900',
        }
      }} />
      
      <View style={styles.container}>
        {/* Fondo con elementos espaciales animados */}
        <Animated.View 
          style={[
            styles.spaceElement,
            styles.planet1,
            {
              transform: [
                { rotate: rotateInterpolate },
                { translateY: floatInterpolate }
              ],
            }
          ]}
        >
          <Globe size={60} color="#00FFFF" />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.spaceElement,
            styles.satellite1,
            {
              transform: [
                { 
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-360deg']
                  }) 
                }
              ],
            }
          ]}
        >
          <Satellite size={40} color="#FFB800" />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.spaceElement,
            styles.rocket1,
            {
              transform: [
                { 
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15]
                  }) 
                }
              ],
            }
          ]}
        >
          <Rocket size={35} color="#E50914" />
        </Animated.View>

        {/* Planetas adicionales con Circle */}
        <Animated.View 
          style={[
            styles.spaceElement,
            styles.planet2,
            {
              transform: [
                { 
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg']
                  }) 
                }
              ],
            }
          ]}
        >
          <Circle size={45} color="#00FF87" fill="#00FF87" />
        </Animated.View>

        {/* Sparkles decorativos con rotación, opacidad Fija */}
        <Animated.View 
          style={[
            styles.sparkle,
            styles.sparkle1,
            {
              transform: [
                { rotate: rotateInterpolate },
              ],
              opacity: 0.7 
            }
          ]}
        >
          <Sparkles size={28} color="#00FF87" />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.sparkle,
            styles.sparkle2,
            {
              transform: [
                { 
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-180deg']
                  }) 
                },
              ],
              opacity: 0.7 
            }
          ]}
        >
          <Sparkles size={22} color="#FF6B9D" />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.sparkle,
            styles.sparkle3,
            {
              transform: [
                { rotate: rotateInterpolate },
              ],
              opacity: 0.7
            }
          ]}
        >
          <Sparkles size={32} color="#00FFFF" />
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: animatedScale } // Usamos la escala condicional
              ]
            }
          ]}
        >
          {/* Icono principal con animación */}
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: pulseScale }
                ]
              }
            ]}
          >
            <View style={styles.iconBackground}>
              <AlertTriangle size={90} color="#E50914" strokeWidth={1.5} />
              <Animated.View 
                style={[
                  styles.iconGlow,
                  {
                    opacity: glowOpacity 
                  }
                ]} 
              />
            </View>
            <Animated.View 
              style={[
                styles.zapIcon,
                {
                  transform: [
                    { 
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '720deg']
                      }) 
                    }
                  ]
                }
              ]}
            >
              <Zap size={45} color="#FFB800" fill="#FFB800" />
            </Animated.View>
          </Animated.View>

          {/* Código de error con efecto neón */}
          <View style={styles.errorCodeContainer}>
            <Text style={styles.errorCode}>4</Text>
            <Animated.View 
              style={[
                styles.zeroContainer,
                {
                  transform: [
                    { rotate: rotateInterpolate }
                  ]
                }
              ]}
            >
              <Text style={styles.errorCode}>0</Text>
              <Animated.View 
                style={[
                  styles.zeroGlow,
                  {
                    opacity: glowOpacity
                  }
                ]} 
              />
            </Animated.View>
            <Text style={styles.errorCode}>4</Text>
          </View>

          {/* Títulos con efectos neón */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>¡PÁGINA PERDIDA</Text>
            <Text style={styles.title}>EN EL ESPACIO!</Text>
            <View style={styles.titleUnderline} />
          </View>
          
          {/* Descripción */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              La página que buscas se ha perdido en la órbita digital.
            </Text>
            <Text style={styles.subDescription}>
              No te preocupes, incluso los astronautas se pierden a veces...
            </Text>
          </View>

          {/* Botón de regreso con animación (Visible solo si NO es isLargeScreen) */}
          {!isLargeScreen && (
            <Animated.View
              style={[
                styles.linkContainer,
                {
                  transform: [
                    { scale: pulseScale }
                  ]
                }
              ]}
            >
              <Link href="/" style={styles.link}>
                <View style={styles.linkContent}>
                  <Home size={24} color="#FFFFFF" />
                  <Text style={styles.linkText}>VOLVER A CASA</Text>
                  <Animated.View 
                    style={[
                      styles.linkGlow,
                      {
                        opacity: glowOpacity
                      }
                    ]} 
                  />
                  <View style={styles.linkPulse} />
                </View>
              </Link>
            </Animated.View>
          )}

          {/* Mensaje del desarrollador */}
          <View style={styles.footer}>
            <Text style={styles.watermark}>
              Desarrollado con ♥️ por Jose Pablo Miranda Quintanilla
            </Text>
          </View>
        </Animated.View>
      </View>
    </>
  );
}

// Los estilos se mantienen igual
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0A0A0A',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    zIndex: 10,
  },
  spaceElement: {
    position: 'absolute',
    opacity: 0.4,
  },
  planet1: {
    top: '10%',
    right: '10%',
  },
  planet2: {
    bottom: '20%',
    left: '10%',
  },
  satellite1: {
    bottom: '25%',
    left: '5%',
  },
  rocket1: {
    top: '40%',
    right: '15%',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: '20%',
    left: '8%',
  },
  sparkle2: {
    bottom: '15%',
    right: '8%',
  },
  sparkle3: {
    top: '60%',
    left: '15%',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 30,
    padding: 25,
  },
  iconBackground: {
    position: 'relative',
    padding: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E50914',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 0.8,
    elevation: 20,
  },
  iconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: '#E50914',
    zIndex: -1,
  },
  zapIcon: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderRadius: 25,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFB800',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0.7,
    elevation: 10,
  },
  errorCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorCode: {
    fontSize: 100,
    fontWeight: '900',
    color: '#00FF87',
    letterSpacing: 5,
    textShadowColor: '#00FF87',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  zeroContainer: {
    position: 'relative',
    marginHorizontal: 10,
  },
  zeroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00FF87',
    borderRadius: 50,
    zIndex: -1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00FFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 5,
  },
  titleUnderline: {
    width: 200,
    height: 3,
    backgroundColor: '#00FFFF',
    marginTop: 10,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.8,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    fontWeight: '600',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  subDescription: {
    fontSize: 14,
    color: '#FFB800',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    textShadowColor: '#FFB800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  linkContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  link: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    paddingHorizontal: 35,
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FF6B6B',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.8,
    elevation: 15,
    position: 'relative',
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  linkGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    backgroundColor: '#E50914',
    borderRadius: 36,
    zIndex: -1,
  },
  linkPulse: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    backgroundColor: '#E50914',
    borderRadius: 42,
    opacity: 0.2,
    zIndex: -2,
  },
  footer: {
    marginTop: 30,
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    alignItems: 'center',
  },
  watermark: {
    fontSize: 12,
    color: '#4ecdc4',
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: '#4ecdc4',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});
