import React,{ useContext,useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";



// ✅ Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const processData = (orders) => {
    const labels = [];
    const freq = {};

    orders.forEach(order => {
        labels.push(order.status)

        if (freq[order.status]) {
            freq[order.status]++;
        }else{
            freq[order.status] = 1;
        }
    });

    let uniqueLabels = Array.from(new Set(labels))

    return {labels: uniqueLabels, data: Object.values(freq)}
    
}

const OrderStatusPieChart = () => {

    const [labelArray, setLabels] = useState([]);
    const [dataArray, setDatas] = useState([]);

    const {
        userData,
        orders,
        fetchOrders,
      } = useContext(AppContext);

    useEffect(() => {
        if (userData?._id) {
            fetchOrders(userData._id);
        }
    
    }, [userData]);

    useEffect(()=> {
        const {labels, data} = processData(orders);
        setLabels(labels);
        setDatas(data);
    }, [orders])


    const data = {
        labels: labelArray,
        datasets: [
            {
                data:dataArray,
                backgroundColor: ["#0096A5", "#FF6F61", "#F4A261", "#4E4E50"], 
                hoverBackgroundColor: ["#007985", "#E45B50", "#E08C50", "#3B3B3D"],
            },
        ],
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg flex justify-center items-center w-full max-w-[1200px] h-[500px] mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Order Status Breakdown</h3>
                <div className="w-full h-full">
                    <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />   
                    
                </div>
        </div>
    );
};

export default OrderStatusPieChart;