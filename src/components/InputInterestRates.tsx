import React, { useEffect, useState } from "react";
import { InterestRateV2, Maybe } from "../types";
import { grey } from "@mui/material/colors";

export default function InterestRateForm(props: any) {
    const [interestRates, setInterestRates] = useState<any>(props.interestRates)

    useEffect(() => {
        props.setInterestRates(interestRates);
    }, [interestRates]);

    const handleAddInterestRate = () => {
        setInterestRates([...interestRates, { iMinDays: "", iStaking: "", iHarvest: "" }]);
    };
 
    const handleRemoveInterestRate = (index: number) => {
        const newInterestRates = [...interestRates];
        newInterestRates.splice(index, 1);
        newInterestRates[newInterestRates.length-1].iMinDays = "";
        setInterestRates(newInterestRates);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, field: string) => {
        const newInterestRates = [...interestRates];
        newInterestRates[index][field] = event.target.value;
        setInterestRates(newInterestRates);
    };

    return (
        <>
            <h4 className="pool__stat-title">Annual pay of Harvest Unit per Staking Unit</h4>
            <br/>
            {interestRates?
                interestRates.map((interestRate: any, index: any) => (
                <div key={index} >
                    <table className="interesRates">
                        <tr>
                            <td style={{width: 120, fontSize: 12}}><b>Minimum Days: </b></td>
                            <td style={{width: 120, fontSize: 12}}>
                                {index<interestRates.length-1?<input
                                    type="text"
                                    style={{ width: 80, fontSize: 12 }} 
                                    value={interestRate.iMinDays}
                                    onChange={(event) => handleInputChange(event, index, "iMinDays")}
                                />
                                :<>No minimum days</>}
                            </td>
                            <td> </td>
                        </tr>
                        <tr>
                            <td style={{width: 120, fontSize: 12}}><b>Staking: </b></td>
                            <td style={{width: 120, fontSize: 12}}>
                                <input
                                type="text"
                                style={{ width: 80, fontSize: 12 }} 
                                value={interestRate.iStaking}
                                onChange={(event) => handleInputChange(event, index, "iStaking")}
                            />
                            </td>
                            <td style={{width: 160, fontSize: 12}}>Hoy much you stake</td>
                            
                        </tr>
                        <tr>
                            <td style={{width: 120, fontSize: 12}}><b>Harvest: </b></td>
                            <td style={{width: 120, fontSize: 12}}>
                                <input
                                type="text"
                                style={{ width: 80, fontSize: 12 }} 
                                value={interestRate.iHarvest}
                                onChange={(event) => handleInputChange(event, index, "iHarvest")}
                            />
                            </td>
                            <td style={{width: 160, fontSize: 12}}>Hoy much you get</td>
                        </tr>
                        {index>0?
                            <tr>
                            <td style={{width: 80, fontSize: 12}}></td>
                            <td style={{width: 120, fontSize: 12}}>
                                <button type="button" onClick={() => handleRemoveInterestRate(index)}>
                                        Remove
                                    </button>
                            </td>
                            <td></td>
                            </tr> 
                            :null
                        }

                    </table>

                    <br />
                    <br />
                    
                </div>))
            :
            null
            }
            
            <button type="button" onClick={handleAddInterestRate}>
                Add Interest Rate
            </button>
            <br /><br />

            <li className="info">This numbers refers to the smallest division of the token when using decimals</li>
            <li className="info">For example, if you are using 6 decimals like in ADA and you enter 1, you are referring to 0.000001 ADA or just 1 lovelace</li>
            <br></br>
            <li className="info">The number entered represents the amount per year:</li>
            <li className="info">Enter 1 to represent 1 per year</li>
            <li className="info">Enter 12 to represent 1 per month (1 x 12 = 12)</li>
            <li className="info">Enter 365 to represent 1 per day (1 x 365 = 365)</li>
            <li className="info">Enter 8760 to represent 1 per hour (1 x 365 x 24 = 8,760)</li>
            <li className="info">Enter 525600 to represent 1 per minute (1 x 365 x 24 x 60 = 525,600)</li>
            <li className="info">Enter 31536000 to represent 1 per second (1 x 365 x 24 x 60 x 60 = 31,536,000)</li>           

        </>
    );
}