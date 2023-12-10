import axios from 'axios'

const BaseApi = {
  get(url) {
    return new Promise((resolve) => {
      axios.get(url).then(response => {
        resolve(response.data);
      });
    })
  }
}

export default BaseApi;