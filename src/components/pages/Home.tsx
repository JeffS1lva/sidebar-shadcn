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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="w-full px-8">
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
              <Card className="w-full shadow-none  ">
                <CardContent className="p-0 w-full">
                  <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-md">
                    <img
                      src={imageUrl}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg shadow-lg"
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

        {/* Container personalizado para o layout dos controles */}
        <div className="flex mt-4 w-full">
          <div className="flex gap-3 ">
            <div className="flex absolute gap-2">
              <div className="relative ">
                <CarouselPrevious className="h-8 w-8 static transform-none position-static" />
              </div>
              <div className="relative">
                <CarouselNext className="h-8 w-8 static transform-none position-static" />
              </div>
            </div>
            {/* Indicadores de pontos */}
            <div className="flex gap-3 absolute right-0">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
                    current === index ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Carousel>

      <hr className="mt-8" />

      <div className="flex justify-between items-center gap-2 py-2">
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-zinc-300 shadow-sm shadow-black px-2 rounded-sm p-1">
            <Mail size={18} />

            <a
              href="mailto:vendas@polarfix.com.br?subject=Contato%20via%20site&body=Olá%20equipe%20PolarFix"
              className="text-sm "
            >
              vendas@polarfix.com.br
            </a>
          </div>
          <div className="border border-zinc-300" />
          <div className="flex items-center gap-3 bg-zinc-300 shadow-sm shadow-black px-2 rounded-sm p-1">
            <Phone size={18} />

            <Select>
              <SelectTrigger className="w-[180px]" variant="secondary">
                <SelectValue placeholder="Selecione Contato"/>
              </SelectTrigger>
              <SelectContent variant="secondary">
                <SelectGroup >
                  <SelectLabel>Contato</SelectLabel>
                  <SelectItem title="Comercial" value="Comercial">11 4512-8600</SelectItem>
                  <SelectItem title="Sac" value="Sac">0800 191099</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="https://www.instagram.com/polar_fix/"
            target="_blank"
            title="Instagram"
            className="bg-zinc-300 p-1 rounded-sm hover:bg-zinc-400 hover:text-white shadow-sm shadow-black"
          >
            <Instagram size={20} />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=551145128600"
            target="_blank"
            title="WhatsApp"
            className="bg-zinc-300 p-1 rounded-sm hover:bg-[#25D366] hover:text-white shadow-sm shadow-black"
          >
            <FaWhatsapp size={20} />
          </a>
          <a
            href="https://www.linkedin.com/company/polar-fix/posts/?feedView=all"
            target="_blank"
            title="Linkedin"
            className="bg-zinc-300 p-1 rounded-sm hover:bg-[#2867b2] hover:text-white shadow-sm shadow-black"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="https://www.youtube.com/@PolarFixHospitalar"
            target="_blank"
            title="Youtube"
            className="bg-zinc-300 p-1 rounded-sm hover:bg-[#c4302b] hover:text-white shadow-sm shadow-black"
          >
            <Youtube size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}
