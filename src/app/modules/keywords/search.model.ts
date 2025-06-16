import { model, Schema } from "mongoose";
import { SearchKeyword } from "./search.interface";


const searchSchema = new Schema<SearchKeyword>({
  keyword: {
    type: String,
    required: true,
    index: true, 
  },
  count: {
    type: Number,
    default: 1
  }
});

const SearchKeyword = model<SearchKeyword>('search_keyword', searchSchema);
export default SearchKeyword