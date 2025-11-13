import Image from "next/image";
import React from "react";
import image from "@/assets/stackedCard.webp";
import { Button } from "../ui/button";
import { Quantico, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";

const quantico = Quantico({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-quantico",
});

const manrope = Manrope({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
});

const SignUpForm = () => {
  return (
    <>
      <div className="flex justify-between">
        <div className="w-[50vw] bg-[#41403A]">
          <div className="flex h-screen justify-center items-center p-6">
            <div className="flex flex-col justify-center items-center gap-6">
              <h1
                className={cn(
                  "text-white font-normal text-5xl text-center leading-14",
                  manrope.className
                )}
              >
                Create Infinite Cards. <br /> Make Endless Payments.
              </h1>
              <Image src={image} alt="cards" width={330} height={330} />
            </div>
          </div>
        </div>
        <div className="flex h-screen justify-center w-[50vw] bg-[#171717] items-center p-6">
          <div className="flex flex-col justify-center items-center gap-6">
            <h1
              className={cn(
                "text-white font-normal text-3xl mb-5",
                quantico.className
              )}
            >
              Sign Up/ Login
            </h1>
            <Button className="text-black bg-white rounded-full hover:text-black hover:bg-white hover:border-white w-[400px] h-[50px] text-lg">
              <span className="flex gap-2 items-center">
                <span>Sign In With Google </span>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="scale-[1.3]"
                >
                  <path
                    d="M15.9996 13.0909V19.2872H24.6105C24.2324 21.2799 23.0977 22.9673 21.3959 24.1018L26.5886 28.1309C29.6141 25.3383 31.3596 21.2364 31.3596 16.3637C31.3596 15.2292 31.2578 14.1382 31.0686 13.091L15.9996 13.0909Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M7.03274 19.0455L5.86159 19.942L1.71606 23.1711C4.34878 28.3928 9.74475 32.0002 15.9992 32.0002C20.3191 32.0002 23.9409 30.5747 26.5882 28.1311L21.3955 24.102C19.9701 25.062 18.1519 25.6439 15.9992 25.6439C11.8393 25.6439 8.30483 22.8366 7.03928 19.0548L7.03274 19.0455Z"
                    fill="#34A853"
                  />
                  <path
                    d="M1.71587 8.82913C0.625023 10.9818 -0.000366211 13.4109 -0.000366211 15.9999C-0.000366211 18.589 0.625023 21.0181 1.71587 23.1708C1.71587 23.1852 7.0396 19.0398 7.0396 19.0398C6.7196 18.0799 6.53046 17.0617 6.53046 15.9998C6.53046 14.9378 6.7196 13.9197 7.0396 12.9597L1.71587 8.82913Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M15.9996 6.3709C18.356 6.3709 20.4505 7.18543 22.1232 8.75636L26.705 4.1746C23.9268 1.58555 20.3196 0 15.9996 0C9.74508 0 4.34878 3.59272 1.71606 8.8291L7.03963 12.96C8.30501 9.17816 11.8396 6.3709 15.9996 6.3709Z"
                    fill="#EA4335"
                  />
                </svg>
              </span>
            </Button>
            <Button className="text-black bg-white rounded-full hover:text-black hover:bg-white hover:border-white w-[400px] h-[50px] text-lg">
              <span className="flex gap-3 items-center">
                <span>Sign In With Apple </span>
                <svg
                  width="27"
                  height="32"
                  viewBox="0 0 27 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="scale-[1.6]"
                >
                  <path
                    d="M19.9395 8.7168L19.9443 8.71777C21.8837 8.87429 23.3546 9.50248 24.4395 10.5664C22.4207 12.1611 21.3708 14.2995 21.3945 16.9209V16.9229C21.4195 19.259 22.2811 21.2511 23.9639 22.8154V22.8164C24.4522 23.2798 24.9812 23.676 25.5498 24.0068C25.4857 24.1707 25.423 24.3328 25.3564 24.4912C24.9014 25.5424 24.3657 26.5042 23.748 27.3848C22.8532 28.6606 22.1768 29.4592 21.7148 29.8604L21.7031 29.8701L21.6914 29.8809C20.9722 30.5422 20.2784 30.8195 19.5869 30.8379C19.0596 30.8346 18.3383 30.6802 17.4014 30.2949L17.3984 30.2939L16.9775 30.1318C16.0005 29.7762 15.0525 29.584 14.1406 29.584C13.0632 29.584 11.9488 29.8311 10.8066 30.292L10.8057 30.293C9.81253 30.695 9.11853 30.8579 8.67285 30.873H8.66309C8.08458 30.8976 7.39327 30.6564 6.56445 29.8857L6.55176 29.873L6.53809 29.8613L6.33594 29.6748C5.84279 29.1968 5.19872 28.4161 4.39941 27.2861L4.39746 27.2842C3.58885 26.1464 2.89783 24.8378 2.3291 23.3486L2.09277 22.6992C1.44293 20.8056 1.12505 18.9965 1.125 17.2646C1.125 15.2848 1.5512 13.6426 2.35645 12.2979L2.3623 12.2891C2.99777 11.2045 3.83304 10.3607 4.87988 9.73926C5.92135 9.12105 7.03926 8.80686 8.25586 8.78516C8.82829 8.7872 9.69012 8.9714 10.9004 9.42285C11.5399 9.66285 12.0837 9.85188 12.5234 9.98145C12.9256 10.0999 13.3552 10.205 13.7109 10.2051C13.9214 10.2051 14.1399 10.1585 14.291 10.1221C14.4697 10.079 14.6804 10.0179 14.916 9.94434C15.3872 9.79718 16.0081 9.58082 16.7715 9.30078L16.7725 9.30176C18.1288 8.81367 19.1691 8.65148 19.9395 8.7168ZM19.041 1.35645C18.8981 2.39741 18.436 3.40375 17.6094 4.38672C16.6643 5.49158 15.657 6.15143 14.6416 6.37012C14.7835 5.30499 15.302 4.16373 16.1748 3.17578L16.1797 3.16992C16.6617 2.61659 17.2899 2.13788 18.0859 1.74414C18.4202 1.58122 18.7389 1.45352 19.041 1.35645Z"
                    fill="#0F0F0F"
                    stroke="black"
                    strokeWidth="2.25"
                  />
                </svg>
              </span>
            </Button>
            <Button className="text-black bg-white rounded-full hover:text-black hover:bg-white hover:border-white w-[400px] h-[50px] text-lg">
              <span className="flex gap-2 items-center">
                <span>Sign In With Facebook </span>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="scale-[1.3]"
                >
                  <g clip-path="url(#clip0_45_917)">
                    <path
                      d="M32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 23.9859 5.85094 30.6053 13.5 31.8056V20.625H9.4375V16H13.5V12.475C13.5 8.465 15.8888 6.25 19.5434 6.25C21.2934 6.25 23.125 6.5625 23.125 6.5625V10.5H21.1075C19.12 10.5 18.5 11.7334 18.5 13V16H22.9375L22.2281 20.625H18.5V31.8056C26.1491 30.6053 32 23.9859 32 16Z"
                      fill="#1877F2"
                    />
                    <path
                      d="M22.2285 20.625L22.9379 16H18.5004V13C18.5004 11.7347 19.1204 10.5 21.1079 10.5H23.1254V6.5625C23.1254 6.5625 21.2944 6.25 19.5438 6.25C15.8891 6.25 13.5004 8.465 13.5004 12.475V16H9.43787V20.625H13.5004V31.8056C15.157 32.0648 16.8438 32.0648 18.5004 31.8056V20.625H22.2285Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_45_917">
                      <rect width="32" height="32" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpForm;
