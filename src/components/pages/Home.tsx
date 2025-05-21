import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Coletor from "@/assets/BannerColetor.jpg";
import Curativos from "@/assets/BannerCurativos.jpg";
import Esterilizacao from "@/assets/BannerEsterilização.jpg";
import Clorexidina from "@/assets/BannerClorexidina.jpg";
import {
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Youtube,
  Landmark,
  ShoppingBag,
  ScanBarcode,
  TruckIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function Init() {
  // URLs das imagens do Unsplash
  const images = [Coletor, Curativos, Esterilizacao, Clorexidina];

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Items para navegação
  const navigationItems = [
    {
      title: "Cotações",
      url: "/cotacao",
      icon: Landmark,
    },
    {
      title: "Pedidos",
      url: "/pedidos",
      icon: ShoppingBag,
    },
    {
      title: "Boletos",
      url: "/boletos",
      icon: ScanBarcode,
    },
    {
      title: "Rastrear Pedidos",
      url: "/rastreio-pedidos",
      icon: TruckIcon,
    },
  ];

  // Monitora mudanças no slide atual
  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    // Limpa o event listener quando o componente é desmontado
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Função para navegar para um slide específico
  const goToSlide = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="w-full px-3 md:px-6 lg:px-8 max-w-screen-2xl mx-auto">
      <Carousel
        className="w-full"
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {images.map((imageUrl, index) => (
            <CarouselItem key={index} className="w-full">
              <Card className="w-full shadow-none">
                <CardContent className="p-0 w-full">
                  <div className="w-full h-40 xs:h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 overflow-hidden rounded-lg shadow-md">
                    <img
                      src={imageUrl}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      style={{
                        boxShadow:
                          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Container responsivo para controles do carousel */}
        <div className="flex flex-wrap w-full relative z-0 my-2 justify-between items-center">
          <div className="flex gap-2">
            <CarouselPrevious className="h-7 w-7 md:h-8 md:w-8 static transform-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700" />
            <CarouselNext className="h-7 w-7 md:h-8 md:w-8 static transform-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700" />
          </div>

          {/* Indicadores de pontos - centralizados em mobile, à direita em desktop */}
          <div className="flex gap-1 md:gap-2 mt-2 sm:mt-0">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors cursor-pointer ${
                  current === index
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Carousel>

      <hr />

      {/* Seção de botões de navegação */}
      <div className="my-4 md:my-5 ">
        <div className="flex flex-col sm:flex">
          <div className="grid grid-cols-1 sm:grid-cols-4 xs:grid-cols-4 md:grid-cols-4 gap-4">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.url}
                className="flex flex-col items-center justify-center bg-white dark:bg-zinc-800 py-2 px-1 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <div className="bg-primary dark:bg-zinc-700 p-2 md:p-3 rounded-full mb-1 md:mb-2">
                  <item.icon size={20} className="text-white" />
                </div>
                <span className="font-medium text-sm md:text-base text-zinc-800 dark:text-zinc-100">
                  {item.title}
                </span>
              </a>
            ))}
          </div>

          {/* Container de contato com melhor ajuste para telas pequenas */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 sm:grid-cols-3 gap-2 w-full mt-4">
            {/* Telefone Comercial com link para ligar diretamente */}
            <a
              href="tel:1145128600"
              title="Comercial"
              className="flex justify-center items-center gap-2 md:gap-3 sm:w-full  bg-primary dark:bg-zinc-700 shadow-sm shadow-black dark:shadow-zinc-900 px-3 py-2 rounded-sm hover:bg-slate-900 dark:hover:bg-zinc-600 transition-colors"
            >
              <Phone
                size={16}
                className="text-primary-foreground dark:text-white flex-shrink-0"
              />
              <span className="text-primary-foreground dark:text-white font-medium text-sm md:text-base">
                (11) 4512-8600
              </span>
            </a>

            {/* Container de links sociais responsivo */}
            
              <a
                href="https://www.instagram.com/polar_fix/"
                target="_blank"
                title="Instagram"
                className="bg-primary flex justify-center items-center gap-2 dark:bg-zinc-700 p-1.5 md:p-2 rounded-sm hover:bg-zinc-900 dark:hover:bg-zinc-600 hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900"
              >
                <Instagram size={18} />
                Instagram
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=551145128600"
                target="_blank"
                title="WhatsApp"
                className="bg-primary flex justify-center items-center gap-2 dark:bg-zinc-700 p-1.5 md:p-2 rounded-sm hover:bg-[#25D366] hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900 dark:hover:bg-[#25D366]"
              >
                <FaWhatsapp size={18} />
                WhatsApp
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=vendas20@polarfix.com.br&su=Contato%20via%20site%20Polar%20Fix&body=Ol%C3%A1%20equipe%20Polar%20Fix%2C%0A%0AGostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20produtos%20e%20servi%C3%A7os%20oferecidos.%0A%0AAtenciosamente%2C%0A"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary flex justify-center items-center gap-2 dark:bg-zinc-700 p-1.5 md:p-2 rounded-sm hover:bg-red-800 hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900 dark:hover:bg-[#c4302b]"
                title="Enviar email"
              >
                <Mail
                  size={18}
                  className="text-primary-foreground dark:text-white"
                />
                E-mail
              </a>
              <a
                href="https://www.linkedin.com/company/polar-fix/posts/?feedView=all"
                target="_blank"
                title="Linkedin"
                className="bg-primary flex justify-center items-center gap-2  dark:bg-zinc-700 p-1.5 md:p-2 rounded-sm hover:bg-[#2867b2] hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900 dark:hover:bg-[#2867b2]"
              >
                <Linkedin size={18} className="flex mb-1"/>
                Linkedin
              </a>
              <a
                href="https://www.youtube.com/@PolarFixHospitalar"
                target="_blank"
                title="Youtube"
                className="bg-primary flex justify-center items-center gap-2 dark:bg-zinc-700 p-1.5 md:p-2 rounded-sm hover:bg-[#c4302b] hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900 dark:hover:bg-[#c4302b]"
              >
                <Youtube size={18} />
                Youtube
              </a>
            
          </div>
        </div>
      </div>
    </div>
  );
}
