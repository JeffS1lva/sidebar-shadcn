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
import { Instagram, Linkedin, Mail, Phone, Youtube } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function Home() {
  // URLs das imagens do Unsplash
  const images = [Coletor, Curativos, Esterilizacao, Clorexidina];

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
    <div className="w-full px-4 md:px-8">
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
                  <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-md">
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

        {/* Container responsivo para controles do carousel - com z-index baixo e suporte para dark mode */}
        <div className="flex w-full relative z-0">
          <div className="flex gap-2 absolute left-0">
            <CarouselPrevious className="h-8 w-8 static transform-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700" />
            <CarouselNext className="h-8 w-8 static transform-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700" />
          </div>

          {/* Indicadores de pontos - centralizados em mobile, à direita em desktop - com suporte para dark mode */}
          <div className="flex gap-2 mx-auto md:ml-auto md:mr-0">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
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

      <hr className="mt-8 border-zinc-300 dark:border-zinc-700" />

      {/* Seção de contatos responsiva - com suporte para dark mode */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
        <div className="flex flex-col  gap-2 w-full md:w-auto">
          {/* Telefone Comercial com link para ligar diretamente */}
          <a
            href="tel:1145128600"
            title="Comercial"
            className=" w-full flex items-center gap-3 bg-primary dark:bg-zinc-700 shadow-sm shadow-black dark:shadow-zinc-900 px-4 py-2 rounded-sm sm:w-auto hover:bg-slate-900 dark:hover:bg-zinc-600 transition-colors"
          >
            <Phone
              size={18}
              className="text-primary-foreground dark:text-white flex-shrink-0"
            />
            <span className="text-primary-foreground dark:text-white font-medium">
              (11) 4512-8600
            </span>
          </a>
        </div>

        {/* Redes sociais - com suporte para dark mode */}
        <div className="flex gap-2 mt-2 md:mt-0 w-full md:w-auto justify-center md:justify-end">
          <a
            href="https://www.instagram.com/polar_fix/"
            target="_blank"
            title="Instagram"
            className="bg-primary dark:bg-zinc-700 p-2 rounded-sm hover:bg-zinc-900 dark:hover:bg-zinc-600 hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900"
          >
            <Instagram size={20} />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=551145128600"
            target="_blank"
            title="WhatsApp"
            className="bg-primary dark:bg-zinc-700 p-2 rounded-sm hover:bg-[#25D366] hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900 dark:hover:bg-[#25D366]"
          >
            <FaWhatsapp size={20} />
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=vendas20@polarfix.com.br&su=Contato%20via%20site%20Polar%20Fix&body=Ol%C3%A1%20equipe%20Polar%20Fix%2C%0A%0AGostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20produtos%20e%20servi%C3%A7os%20oferecidos.%0A%0AAtenciosamente%2C%0A"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary dark:bg-zinc-700 p-2 rounded-sm hover:bg-red-800 hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900 dark:hover:bg-[#c4302b] "
            title="Enviar email"
          >
            <Mail
              size={20}
              className="text-primary-foreground dark:text-white"
            />
          </a>
          <a
            href="https://www.linkedin.com/company/polar-fix/posts/?feedView=all"
            target="_blank"
            title="Linkedin"
            className="bg-primary dark:bg-zinc-700 p-2 rounded-sm hover:bg-[#2867b2] hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900 dark:hover:bg-[#2867b2]"
          >
            <Linkedin size={20} />
          </a>

          <a
            href="https://www.youtube.com/@PolarFixHospitalar"
            target="_blank"
            title="Youtube"
            className="bg-primary dark:bg-zinc-700 p-2 rounded-sm hover:bg-[#c4302b] hover:text-white text-muted dark:text-zinc-100 shadow-sm shadow-black dark:shadow-zinc-900 dark:hover:bg-[#c4302b] "
          >
            <Youtube size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}
