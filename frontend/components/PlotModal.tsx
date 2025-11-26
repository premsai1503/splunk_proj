import React from 'react';
import Plot from 'react-plotly.js';
import { XIcon } from './icons';

interface PlotModalProps {
    plotJson: string;
    onClose: () => void;
}

const PlotModal: React.FC<PlotModalProps> = ({ plotJson, onClose }) => {
    let plotData = null;
    try {
        plotData = JSON.parse(plotJson);
    } catch (e) {
        console.error("Failed to parse plot data", e);
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition z-50"
            >
                <XIcon className="w-8 h-8" />
            </button>
            <div
                className="w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking on the content
            >
                <div className="flex-1 w-full h-full p-4">
                    <Plot
                        data={plotData.data}
                        layout={{ ...plotData.layout, autosize: true }}
                        config={plotData.config}
                        frames={plotData.frames}
                        useResizeHandler={true}
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlotModal;
