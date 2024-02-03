import { resetICParams } from '../../client/resetICParams.js'

/**
* server got our message
*/
export const handleackMS = () => {
    resetICParams();
}