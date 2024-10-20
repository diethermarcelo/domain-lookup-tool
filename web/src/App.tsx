import { ChangeEvent, FormEvent, useId, useState } from 'react'
import './App.css'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

type TableRowResponse = {
  domainName?: string,
  registrarName?: string,
  createdDate?: string,
  expiresDate?: string,
  hostNames?: string[],
  registrantName?: string,
  technicalContactName?: string,
  administrativeContactName?: string,
  contactEmail?: string,
}

type KEYS = 'domainName' | 'registrarName' | 'createdDate' | 'expiresDate' | 'hostNames' | 'registrantName' | 'technicalContactName' | 'administrativeContactName' | 'contactEmail'

function App() {

  const informationTypes = [
    {
      label: "Domain Information",
      value: "domain-information"
    },
    {
      label: "Contact Information",
      value: "contact-information"
    }
  ]

  const HEADERS = {
    domainName: 'Domain Name',
    registrarName: 'Registrar',
    createdDate: 'Registration Date',
    expiresDate: 'Expiration Date',
    hostNames: 'Hostnames',
    estimatedDomainAge: 'Estimated Domain Age',
    registrantName: 'Registrant Name',
    technicalContactName: 'Technical Contact Name',
    administrativeContactName: 'Administrative Contact Name',
    contactEmail: 'Contact Email',
  }

  const [ domainName, setDomainName ] = useState('');
  const [ informationType, setInformationType ] = useState('domain-information');
  const [ responseInformationType, setResponseInformationType ] = useState('');
  const [ tableRowData, setTableRowData ] = useState<TableRowResponse>({});

  const domainNameId = useId();
  const informationTypeId = useId();

  const fetchDomainData = async () => {
    try {
      const config: AxiosRequestConfig = {
        params: {
          domainName,
          type: informationType
        }
      }
  
      setResponseInformationType(informationType);
  
      const response = await axios.get(`http://localhost:3000/domains`, config);
  
      const { data } = response;
  
      setTableRowData(data);

    } catch (e) {
      
      const PLEASE_TRY_AGAIN = "Please try again later.";
      
      if (e instanceof AxiosError) return alert(e?.response?.data || PLEASE_TRY_AGAIN);

      alert(PLEASE_TRY_AGAIN);

    }
  }

  const handleDomainNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDomainName(event.target.value)
  }

  const handleInformationTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setInformationType(event.target.value);
  }

  const validate = () => {
    const errors = [];

    if (!domainName) errors.push({text: "Please input name"});

    return errors;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTableRowData({});

    const errors = validate();  
   
    if (errors.length <= 0) fetchDomainData();
    else {
      alert(errors[0].text);
    }



  }


  const displayRowBody = (key: KEYS) => {
    const maxhostNameLength = 25;

    if (!tableRowData) return null;

    console.log(tableRowData[key], 'tableRowData[key].length', key)
    if (key === 'hostNames') {
      const joinedHostNames = tableRowData[key]?.join();
      if (joinedHostNames && joinedHostNames.length > maxhostNameLength) {
        return <td> {joinedHostNames.substring(0, maxhostNameLength)}... </td>
      }
    }
    return <td> { tableRowData[key] || 'blank' } </td>
  }

  const displayTableInformation = () => {    
    console.log(tableRowData, 'tableRowData')
    return (
      <>
        <thead>
          {Object.keys(tableRowData).map((header) => <th> {HEADERS[header]}</th>)}
        </thead>
        <tbody>
          <tr>
            {Object.keys(tableRowData).map(displayRowBody)}
          </tr>
        </tbody>
      </>
    )
  }

  return (
    <div className="bg-[#F8F7F5] min-h-screen">
      <header className="bg-white py-3">
        <nav className="mx-auto max-w-4xl">
          <h1 className="font-semibold text-neutral-800">
            <a href="">
               Domain Lookup Tool
            </a>
          </h1>
        </nav>
      </header>
      <main className="py-3 max-w-4xl mx-auto">
        <section className="input-section">
          <h2 className="font-semibold text-neutral-800 py-3"> Check Domain </h2>
          <form className="bg-white px-5 pt-3 pb-5" onSubmit={handleSubmit}>
            <div className="form-group flex flex-col my-2">
              <label htmlFor={domainNameId} className="">
                Domain Name:
              </label>
              <input name="domain_name" id={domainNameId} value={domainName} onChange={handleDomainNameChange} placeholder="Input domain name" className="px-3 py-2"/>
            </div>
            <div className="form-group flex flex-col my-2">
              <label htmlFor={informationTypeId}>
                Information Type:
              </label>
              <select className="px-2 py-2" id={informationTypeId} onChange={handleInformationTypeChange}>
                {informationTypes.map((informationTypeOption) => <option value={informationTypeOption.value} selected={informationTypeOption.value === informationType}> {informationTypeOption.label} </option>)}
              </select>
            </div>
            <button type="submit" className="bg-[#22331D] text-white w-full py-2 mt-3"> Search </button>
          </form>
        </section>
        {Object.keys(tableRowData).length > 0 && (
          <section className="output-section">
          <h2 className="font-semibold text-neutral-800 py-3"> {informationTypes.find((infoType) => infoType.value === responseInformationType)?.label} </h2>
          <div className="bg-white px-5 pt-3 pb-5">
            <table className="text-center w-full font-normal">
              {displayTableInformation()}
            </table>
          </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
