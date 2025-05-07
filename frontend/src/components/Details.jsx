import React from 'react';
import Button from '../components/Button.jsx';
import Lottie from 'lottie-react';
import '../styles/Details.css';
import chatAnimation from '../assets/chat-animation.json'
import videoAnimation from '../assets/video-animation.json'
import uniAnimation from '../assets/uni-animation.json'
import bookAnimation from '../assets/book-animation.json'
import contactAnimation from '../assets/contact-animation.json'

const Details = () => {
    return (
        <section className="c-space my-20" id="about">
          <div className="grid xl:grid-cols-3 xl:grid-rows-6 md:grid-cols-2 grid-cols-1 gap-5 h-full">
            <div className="col-span-1 xl:row-span-3">
              <div className="grid-container">
              <Lottie animationData={videoAnimation} className="w-full sm:h-[276px] h-fit object-contain" />
    
                <div>
                  <p className="grid-headtext">Video Therapy Sessions</p>
                  <p className="grid-subtext">
                    Experience personalized and confidential therapy sessions from the comfort of your own home through secure video calls. 
                  </p>
                </div>
              </div>
            </div>
    
            <div className="col-span-1 xl:row-span-3">
              <div className="grid-container">
                <Lottie animationData={chatAnimation} className="w-full sm:h-[276px] h-fit object-contain" />
    
                <div>
                  <p className="grid-headtext">Chat with Your Therapist</p>
                  <p className="grid-subtext">
                    Connect with your therapist through our real-time chat feature. 
                  </p>
                </div>
              </div>
            </div>
    
            <div className="col-span-1 xl:row-span-4">
              <div className="grid-container">
                <div className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center">
                <Lottie animationData={uniAnimation} className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center" />
                </div>
                <div>
                  <p className="grid-headtext mt-3">Book Through Your University</p>
                  <p className="grid-subtext">Are you a student? Schedule appointments through your university.</p>
                  <Button name="Click Here" isBeam containerClass="w-full mt-10" />
                </div>
              </div>
            </div>
    
            <div className="xl:col-span-2 xl:row-span-3">
              <div className="grid-container">
              <Lottie animationData={bookAnimation} className="w-full sm:h-[266px] h-fit object-contain" />
    
                <div>
                  <p className="grid-headtext">Schedule an Appointment Now</p>
                  <p className="grid-subtext">
                    Take the first step towards better mental health by scheduling an appointment with one of our qualified therapists. We're here to support you on your journey.
                  </p>
                </div>
              </div>
            </div>
    
            <div className="xl:col-span-1 xl:row-span-2">
              <div className="grid-container">
              <Lottie animationData={contactAnimation}
                  className="w-full md:h-[126px] sm:h-[276px] h-fit object-cover sm:object-top"
                />
    
                <div className="space-y-2">
                  <p className="grid-headtext text-center">Contact Us</p>
                  
                </div>
              </div>
            </div>
          </div>
        </section>
      );
}

export default Details
