export class fecha {
        formatfechaparamysql(año, mes,dia, hora, minuto, segundo){
        const messtr = String(mes).padStart(2, '0');
        const diastr = String(dia).padStart(2, '0');
        const horastr = String(hora).padStart(2, '0');
        const minutostr = String(minuto).padStart(2, '0');
        const segstr = String(segundo).padStart(2, '0');

        return `${año}-${messtr}-${diastr} ${horastr}:${minutostr}:${segstr}`
    }


    //Funcion para obtener la fecha actual ya en el formato que usa mysql AAAA-MM-DD HH:MM:SS
    obtenerfechaactualenformatomysql(){
        const date = new Date() //Clase de javascript para obtener fecha del sistema
        const año = date.getFullYear()
        const mes = date.getMonth() + 1
        const dia = date.getDate()
        const hora = date.getHours()
        const minuto = date.getMinutes()
        const segundo = date.getSeconds()

        return this.formatfechaparamysql(año, mes, dia, hora, minuto, segundo);
    }
}