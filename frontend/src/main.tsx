import { AppRegistry } from 'react-native-web';
import App from './App';
import './reset.css';

AppRegistry.registerComponent('VolumeMate', () => App);

AppRegistry.runApplication('VolumeMate', {
  rootTag: document.getElementById('root'),
});
