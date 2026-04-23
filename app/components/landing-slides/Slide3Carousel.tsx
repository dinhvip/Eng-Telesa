import { useState, useEffect } from "react";
import Image from "next/image";
import MobileHeader from "../MobileHeader";
import MobileFloatingActions from "../MobileFloatingActions";
import { useHorizontalSwipe } from "../useHorizontalSwipe";

export const kidSlidesData = [
  {
    image: "/assets/3-kid.png",
    alt: "Telesa English Kids online learning",
    title: "Học tiếng anh trực tuyến",
    description:
      "Có thể học tiếng anh cùng Telesa bất cứ khi nào, ở bất kỳ đâu một cách hiệu quả",
  },
  {
    image: "/assets/3-2-kid.png",
    alt: "Chuẩn bị thiết bị học",
    title: "Chuẩn bị thiết bị học",
    description:
      "Chỉ cần chuẩn bị thiết bị có thể kết nối với internet và cùng học thôi!",
  },
  {
    image: "/assets/3-3-common.png",
    alt: "Truy cập vào website",
    title: "Truy cập vào website",
    description:
      "Khám phá những khóa học hoặc tiếp tục học những khóa học của bạn",
  },
  {
    image: "/assets/3-4-common.png",
    alt: "Nộp bài và sửa bài",
    title: "Nộp bài và sửa bài",
    description:
      "Giáo viên sẽ sửa bài chi tiết sau khi nhận được bài nộp của bạn. Nhớ làm bài tập đầy đủ nhé !",
  },
];

export const adultSlidesData = [
  {
    image: "/assets/3-adult.png",
    alt: "Telesa English online learning",
    title: kidSlidesData[0].title,
    description: kidSlidesData[0].description,
  },
  kidSlidesData[1],
  kidSlidesData[2],
  kidSlidesData[3],
];

interface Slide3CarouselProps {
  variant: "kid" | "adult";
  onMenuOpen: () => void;
  onCtaClick: () => void;
  onScrollToTop: () => void;
}

export default function Slide3Carousel({
  variant,
  onMenuOpen,
  onCtaClick,
  onScrollToTop,
}: Slide3CarouselProps) {
  const isKid = variant === "kid";
  const slides = isKid ? kidSlidesData : adultSlidesData;
  const logoSrc = isKid ? "/assets/logo.png" : "/assets/svg/logo.png";
  const logoAlt = isKid ? "Telesa English Kids logo" : "Telesa English logo";

  const [slideIndex, setSlideIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  const changeSlide = (nextIndex: number) => {
    if (nextIndex === slideIndex) return;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setTextVisible(false);
    setTimeout(() => {
      setSlideIndex(nextIndex);
      setTextVisible(true);
    }, 220); // matching delay from original design
  };

  useEffect(() => {
    const autoPlayInterval = setInterval(() => {
      const nextIndex = (slideIndex + 1) % slides.length;
      changeSlide(nextIndex);
    }, 3000);
    return () => clearInterval(autoPlayInterval);
  }, [slideIndex, slides.length]);


  const swipeHandlers = useHorizontalSwipe<HTMLDivElement>({
    onSwipeLeft: () => changeSlide(slideIndex + 1),
    onSwipeRight: () => changeSlide(slideIndex - 1),
  });

  return (
    <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white">
      {/* Mobile */}
      <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 text-slate-900 lg:hidden">
        <MobileHeader
          logoSrc={logoSrc}
          logoAlt={logoAlt}
          logoPriority
          onMenuOpen={onMenuOpen}
          onCtaClick={onCtaClick}
          {...(!isKid && { logoWrapperClassName: "relative h-[50px] w-[50px] shrink-0", logoImageSize: 50 })}
          ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
          menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
          menuLineClassName="bg-white"
        />

        <div
          className="mt-4 flex flex-1 flex-col items-center justify-center"
          style={{ touchAction: "pan-y" }}
          {...swipeHandlers}
        >
          <div className="relative h-[374px] w-full max-w-sm overflow-hidden">
            <div
              className="flex h-full w-full transform-gpu transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className="flex w-full flex-shrink-0 flex-col items-center justify-center"
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    width={368}
                    height={440}
                    sizes="(max-width: 768px) 90vw, 368px"
                    quality={100}
                    className="h-full w-full object-contain"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => changeSlide(index)}
                className={`h-1 rounded-full transition-all ${index === slideIndex
                  ? `w-6 ${isKid ? "bg-amber-400" : "bg-amber-400"}`
                  : "w-4 bg-slate-300"
                  }`}
              />
            ))}
          </div>

          {/* Text content + actions */}
          <div
            className={`mt-6 flex w-full items-start justify-between gap-4 transform-gpu transition-all duration-300 ease-out ${textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
          >
            <div className="flex-1 text-left">
              <h2 className="text-xl font-semibold text-slate-900">
                {slides[slideIndex].title}
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                {slides[slideIndex].description}
              </p>
            </div>
            <MobileFloatingActions variant={variant} tone="light" size="sm" onScrollToTop={onScrollToTop} />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="relative z-10 hidden h-full w-full items-center justify-between px-[8vw] lg:flex">
        <div className="flex w-[56%] flex-col items-center">
          <div className="relative w-full max-w-[760px]">
            <div
              className="relative h-[64vh] max-h-[680px] w-full select-none cursor-grab active:cursor-grabbing"
              style={{ touchAction: "pan-y" }}
              {...swipeHandlers}
            >
              <div
                className={`relative mx-auto h-full w-full max-w-[560px] transform-gpu transition-all duration-300 ease-out ${textVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-2 scale-[0.99]"
                  }`}
              >
                <Image
                  src={slides[slideIndex].image}
                  alt={slides[slideIndex].alt}
                  fill
                  sizes="(min-width: 1024px) 560px, 90vw"
                  quality={100}
                  className="object-contain"
                  draggable={false}
                  priority
                />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => changeSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${index === slideIndex ? "w-10 bg-amber-400" : "w-7 bg-slate-300"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`w-[40%] max-w-[560px] text-left transform-gpu transition-all duration-300 ease-out ${textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
        >
          <h2 className="text-[44px] font-semibold leading-tight text-slate-900">
            {slides[slideIndex].title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-500">
            {slides[slideIndex].description}
          </p>
        </div>
      </div>
    </section>
  );
}
