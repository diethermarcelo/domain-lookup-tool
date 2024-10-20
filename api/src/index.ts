import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios, { AxiosRequestConfig } from 'axios';
import { getEnv, ENV } from './core/utils/helper';
import cors from 'cors'
import { ParameterError, WhoIsAPIResponseError } from './core/utils/errors';

dotenv.config();

const app = express();

app.use(cors());



app.get('/', (req: Request, res: Response) => {
    res.send(`Welcome to ${process.env.APP_NAME}`)
})

enum DOMAIN_RESPONSE_TYPE {
    DOMAIN_INFORMATION = 'domain-information',
    CONTACT_INFORMATION = 'contact-information'    
}

const DOMAIN_INFORMATION = [
    'domain_name', // domainName
    'registrar', // registrarName
    'registration_date', // createdDate
    'expiration_date', //  expiresDate
    'estimated_domain_age', // estimatedDomainAge
    'host_names' // nameServer.hostNames []
]

const CONTACT_INFORMATION = [
    'registrant_name', // registrant.name
    'technical_contact_name', // technicalContact.name
    'administrative_contact_name', // administrativeContact.name
    'contact_email' // contactEmail
]

const getInformationByType = (data: any, type: DOMAIN_RESPONSE_TYPE) => {
    let information = {};

    console.log(data, 'data now?')
    if (type === DOMAIN_RESPONSE_TYPE.DOMAIN_INFORMATION) {
        const { domainName = '', registrarName = '', createdDate = '', expiresDate = '', estimatedDomainAge = '', nameServers: { hostNames = [] } } = data;
        
        information = {
            domainName, registrarName, createdDate, expiresDate, estimatedDomainAge, hostNames
        }

    } else {
        console.log('goes here?', type)
        const { 
            registrant: { name: registrantName = '' }, 
            technicalContact: { name: technicalContactName = '' }, 
            administrativeContact: { name: administrativeContactName = '' }, 
            contactEmail = ''
        } = data;
        
        information =  { 
            registrantName, 
            technicalContactName, 
            administrativeContactName, 
            contactEmail
        }
    }


    return information;
}


interface RequestParams {}

interface ResponseBody {}

interface RequestBody {}

interface RequestQuery {
  domainName: string;
  type: DOMAIN_RESPONSE_TYPE
}

app.get('/domains', async (req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>, res: any) => {
    try {
        const { domainName, type = DOMAIN_RESPONSE_TYPE.DOMAIN_INFORMATION } = req.query;
        
        if (!domainName) throw new ParameterError("Please provide name as query parameter");

        const WHOISAPI_URL = getEnv(ENV.WHOISAPI_URL);

        if (!WHOISAPI_URL) throw new ParameterError("Please configure environments") // TODO: Custom Error
            
        const config: AxiosRequestConfig = {
            headers: {
                
            },
            params: {
                apiKey: process.env.WHOISAPI_TOKEN,
                domainName,
                outputFormat: 'JSON'
            }
        }

        const response = await axios.get(WHOISAPI_URL, config);
        const { data } = response; 

        const { WhoisRecord, ErrorMessage } = data;

        if (ErrorMessage) throw new WhoIsAPIResponseError(ErrorMessage.errorCode, ErrorMessage.msg);

        const information = getInformationByType(WhoisRecord, type);

        res.send(information);

    } catch (e) {
        // TODO: add custom catch for different errors

        console.log(e, 'error here: ')
        if (e instanceof ParameterError) return res.status(400).send(e.message);

        if (e instanceof WhoIsAPIResponseError) return res.status(400).send(e.message);

        return res.status(500).send("Please try again later.");
    }
    
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is listening to ${PORT}`)
});

