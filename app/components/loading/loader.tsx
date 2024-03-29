import Lottie from "lottie-react";
import orbit from "./orbit.json";

export function OrbitLoader() {
  return <Lottie animationData={orbit} loop={true} className="w-[85px]" />;
}