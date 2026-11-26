import { useWindowDimensions } from "react-native";

export default function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;
  const columns = isDesktop ? 4 : isTablet ? 3 : 2;
  return { width, height, isMobile, isTablet, isDesktop, columns };
}
