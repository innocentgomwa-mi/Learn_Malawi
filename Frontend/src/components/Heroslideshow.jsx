import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../styles/landing_page.css";
import students from "../images/students.jpg";
import student from "../images/student.jpg";
import people from "../images/people.jpg";

const Heroslideshow = () => {
  const images = [students, student, people];

  return (
    <div className="hero-slideshow-wrapper">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
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
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Heroslideshow;
