import configFile from '../../config.json';
import { ConfigInterface } from '../types/config';

const get = (): ConfigInterface => {
  return configFile;
};

export default {get};
