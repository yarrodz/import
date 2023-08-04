export default interface Column {
  name: string;
  type: string | Column[];
}
