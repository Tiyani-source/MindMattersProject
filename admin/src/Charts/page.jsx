import AreaChart from "./components/AreaChart";
import BarChartComponent from "./components/BarChart";
import LineChartComponent from "./components/LineChart";
import PieChartComponent from "./components/PieChart";


export default function Home() {
  return (
    <main className="px-5">
      <div className="grid xl:grid-cols-2 gap-10 max-w-[1400px] py-10">
        <GridItem title="Sessions Conducted">
          <LineChartComponent />
        </GridItem>
        <GridItem title="Sessions Type">
          <PieChartComponent />
        </GridItem>
      </div>

      <div className="grid xl:lg:w-full gap-10 max-w-[1400px]">
        <GridItem title="Earnings">
          <AreaChart />
        </GridItem>
      </div>

      <div className="grid xl:lg:w-full gap-10 max-w-[1400px] py-10">
        <GridItem title="Patient Count">
          <BarChartComponent />
        </GridItem>
      </div>
    </main>
  );
}

function GridItem({ title, children }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-300 bg-white shadow-lg rounded-xl h-[400px]">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}
