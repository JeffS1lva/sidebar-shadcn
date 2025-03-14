"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  RadialBar,
  RadialBarChart,
  XAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Dados para o gráfico de barras
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

// Dados para o gráfico radial (de navegadores)
const radialChartData = [
  { browser: "Chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "Safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "Firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "Edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "Other", visitors: 90, fill: "var(--color-other)" },
];

// Configuração de cores e rótulos para os gráficos
const chartConfig: ChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(192.9 82.3% 31%)",
  },
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Kit",
    color: "hsl(192.9 82.3% 31%)",
  },
  safari: {
    label: "Safari",
    color: "hsl(192.9 82.3% 31%)",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(192.9 82.3% 31%)",
  },
  edge: {
    label: "Edge",
    color: "hsl(192.9 82.3% 31%)",
  },
  other: {
    label: "Other",
    color: "hsl(192.9 82.3% 31%)",
  },
};

export function Home() {
  return (
    <div className="p-10 flex justify-between h-full gap-5 w-full ">
      {/* Gráfico de Compras (Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Compras</CardTitle>
          <CardDescription>Janeiro - Julho 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)} // Abreviação do nome dos meses
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
              <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Tendência de alta de 5,2% este mês{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Mostrando o total de visitantes nos últimos 6 meses
          </div>
        </CardFooter>
      </Card>

      {/* Gráfico Radial (Radial Bar Chart) */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Produtos - Destaque</CardTitle>
          <CardDescription>Janeiro - Junho 2024</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart
              data={radialChartData}
              startAngle={-90}
              endAngle={360}
              innerRadius={30}
              outerRadius={110}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="browser" />}
              />
              <RadialBar dataKey="visitors" background>
                <LabelList
                  position="insideStart"
                  dataKey="browser"
                  className="fill-white capitalize mix-blend-luminosity"
                  fontSize={11}
                />
              </RadialBar>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Tendência de alta de 5,2% este mês <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Mostrando o total de visitantes nos últimos 6 meses
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
