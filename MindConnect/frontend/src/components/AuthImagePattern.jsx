import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../animations/therapy.json"; // path to your Lottie file

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 text-center px-10">
      <Player
        autoplay
        loop
        src={animationData}
        style={{ height: '300px', width: '300px' }}
      />
      <h2 className="text-3xl font-bold text-indigo-700 mt-4">{title}</h2>
      <p className="text-gray-700 text-lg leading-relaxed max-w-md mt-2">{subtitle}</p>
    </div>
  );
};

export default AuthImagePattern;