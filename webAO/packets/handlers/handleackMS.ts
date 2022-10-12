import { resetICParams } from '../../client/resetICParams'

/**
* server got our message
*/
export const handleackMS = () => {
    resetICParams();
}