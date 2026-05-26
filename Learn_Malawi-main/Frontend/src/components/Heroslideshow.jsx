import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
<<<<<<< HEAD
import "../styles/landing_page.css"; 
import students from "../images/students.jpg";
import student from "../images/student.jpg";
import people from "../images/people.jpg";
      
const Heroslideshow = () => {
  
=======

import students from "../images/students.jpg";
import student from "../images/student.jpg";
import people from "../images/people.jpg";

const Heroslideshow = () => {
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
  const images = [students, student, people];

  return (
    <div className="hero-slideshow-wrapper">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
<<<<<<< HEAD
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        slidesPerView={1}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img src={img} alt={`Hero ${index + 1}`} className="slide-image" />
=======
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop
        pagination={{ clickable: true }}
        navigation
        slidesPerView={1}
        speed={800}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`Hero slide ${index + 1}`}
              className="slide-image"
            />
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

<<<<<<< HEAD
export default Heroslideshow;
=======
export default Heroslideshow;
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
