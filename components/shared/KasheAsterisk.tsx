import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import colours from '../../constants/colours';

type Props = {
  size?: number;
  animated?: boolean;
};

// 6 spokes evenly at 60° intervals, top-right spoke is the accent "k stroke"
// Angles from vertical top, going clockwise: 0°, 60°, 120°, 180°, 240°, 300°
function getSpokes(size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // Angles in radians, starting from top (−90° in SVG coords), clockwise
  const anglesDeg = [90, 30, -30, -90, -150, 150]; // standard trig angles

  return anglesDeg.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x2: cx + r * Math.cos(rad),
      y2: cy - r * Math.sin(rad), // SVG y is inverted
      // top-right spoke (30°, index 1) is the accent k stroke
      color: i === 1 ? colours.accent : colours.textSecondary,
    };
  });
}

export default function KasheAsterisk({ size = 32, animated: shouldAnimate = false }: Props) {
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

  const spokes = getSpokes(size);
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = Math.max(1.5, size / 18);

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
