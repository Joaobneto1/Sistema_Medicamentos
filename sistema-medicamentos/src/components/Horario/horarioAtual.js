import React, { useState, useEffect } from "react";

function HorarioAtual() {
    const [time, setTime] = useState("Carregando...");
    const [baseTime, setBaseTime] = useState(null);

    useEffect(() => {
        const fetchTime = async () => {
            try {
                const apiKey = "GHQ1EHZZA0FT";
                const response = await fetch(
                    `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=America/Sao_Paulo`
                );

                if (!response.ok) {
                    throw new Error(`Erro ao buscar o horário: ${response.status}`);
                }

                const data = await response.json();
                if (data && data.formatted) {
                    const apiTime = new Date(data.formatted);
                    setBaseTime(apiTime);
                    setTime(apiTime.toLocaleTimeString());
                } else {
                    throw new Error("Resposta inválida da API");
                }
            } catch (error) {
                console.error("Erro ao buscar o horário:", error);
                setTime("Erro ao carregar horário");
            }
        };

        fetchTime();
    }, []);

    useEffect(() => {
        if (baseTime) {
            const interval = setInterval(() => {
                setBaseTime((prevTime) => {
                    const updatedTime = new Date(prevTime.getTime() + 1000);
                    setTime(updatedTime.toLocaleTimeString());
                    return updatedTime;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [baseTime]);

    return <span>{time}</span>;
}

export default HorarioAtual;
