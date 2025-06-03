import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

// Create an instance of Notyf
const notyf = new Notyf({
    position: {
        x: 'right', // 'left', 'center', or 'right'
        y: 'top', // 'top' or 'bottom'
    },
    duration: 3000, // 0 = infinite duration
    types: [
        {
            type: 'success',
            background: '#198754',
        },
    ],
    dismissible: true,

    //   ripple:false
})

export default notyf
