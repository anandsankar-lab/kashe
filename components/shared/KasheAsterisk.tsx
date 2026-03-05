import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import colours from '../../constants/colours';

interface KasheAsteriskProps {
  size?: number;
  animated?: boolean;
  direction?: 'up' | 'down' | 'neutral';
}

// Spec stroke indices (0deg = top, clockwise):
//   0: 0deg  (straight up)    — trig 90°
//   1: 60deg                  — trig 30°
//   2: 120deg                 — trig -30°
//   3: 180deg (straight down) — trig -90°
//   4: 240deg                 — trig -150°
//   5: 300deg (k-stroke)      — trig 150°
const TRIG_ANGLES_DEG = [90, 30, -30, -90, -150, 150];

function getStrokeColor(
  index: number,
  direction: 'up' | 'down' | 'neutral' | undefined
): string {
  switch (direction) {
    case 'up':
      // Stroke 0 (top) and Stroke 5 (k-stroke): accent; all others: textDim
      if (index === 0 || index === 5) return colours.accent;
      return colours.textDim;
    case 'down':
      // Stroke 3 (bottom): danger; all others: textDim (k-stroke included)
      if (index === 3) return colours.danger;
      return colours.textDim;
    case 'neutral':
    default:
      // Stroke 5 (k-stroke): accent; all others: textDim
      if (index === 5) return colours.accent;
      return colours.textDim;
  }
}

function getSpokes(
  size: number,
  direction: 'up' | 'down' | 'neutral' | undefined
) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  return TRIG_ANGLES_DEG.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x2: cx + r * Math.cos(rad),
      y2: cy - r * Math.sin(rad), // SVG y is inverted
      color: getStrokeColor(i, direction),
    };
  });
}

export default function KasheAsterisk({
  size = 32,
  animated: shouldAnimate = false,
  direction,
}: KasheAsteriskProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!shouldAnimate) {
      opacity.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [shouldAnimate, opacity]);

  const spokes = getSpokes(size, direction);
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.12;

  return (
    <Animated.View style={{ opacity, width: size, height: size }}>
      <Svg width={size} height={size}>
        {spokes.map((spoke, i) => (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={spoke.x2}
            y2={spoke.y2}
            stroke={spoke.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
