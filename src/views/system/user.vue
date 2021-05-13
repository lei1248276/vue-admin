<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.cname" placeholder="搜索用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.importance" placeholder="重要性" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="160px" align="center" label="时间">
        <template slot-scope="{row}">
          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" align="center" label="重要级">
        <template slot-scope="{row}">
          <svg-icon v-for="n in + row.importance" :key="n" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column>

      <el-table-column width="100px" align="center" label="用户名">
        <template slot-scope="{row}">
          <span>{{ row.cname }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" align="center" label="性别">
        <template slot-scope="{row}">
          <span>{{ row.boolean_sex ? '男' : '女' }}</span>
        </template>
      </el-table-column>

      <el-table-column width="110" align="center" label="电话">
        <template slot-scope="{row}">
          <span>{{ row.regexp_phone }}</span>
        </template>
      </el-table-column>

      <el-table-column width="240" align="center" label="邮箱">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column width="240" align="center" label="所在地">
        <template slot-scope="{row}">
          <span>{{ row.city }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="280px" label="备注">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.remark" class="edit-input" size="small" />
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >
              取消
            </el-button>
          </template>
          <span v-else>{{ row.remark }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            icon="el-icon-circle-check-outline"
            @click="confirmEdit(row)"
          >
            完成
          </el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="添加" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="时间" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="请选择时间" />
        </el-form-item>
        <el-form-item label="姓名" prop="cname">
          <el-input v-model="temp.cname" />
        </el-form-item>
        <el-form-item label="性别" prop="boolean_sex">
          <el-select v-model="temp.boolean_sex" class="filter-item" placeholder="请选择">
            <el-option v-for="item in [true, false]" :key="item" :label="item?'男':'女'" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="regexp_phone">
          <el-input v-model.number="temp.regexp_phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="所在地" prop="city">
          <el-input v-model="temp.city" />
        </el-form-item>
        <el-form-item label="重要性">
          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createArticle, fetchList } from '@/api/article';
import { parseTime } from '@/utils';
import Pagination from '@/components/Pagination';
import { validPhoneNum, validEmail } from '@/utils/validate';

export default {
  name: 'DataSystem',
  components: { Pagination },
  data() {
    const validatePhoneNum = (rule, value, callback) => {
      if (!validPhoneNum(value)) {
        callback(new Error('手机号码不合法！'));
      } else {
        callback();
      }
    };
    const validateEmail = (rule, value, callback) => {
      if (!validEmail(value)) {
        callback(new Error('邮箱不合法！'));
      } else {
        callback();
      }
    };
    return {
      total: 0,
      list: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        cname: undefined
      },
      importanceOptions: [1, 2, 3],
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        name: '',
        boolean_sex: '',
        regexp_phone: '',
        email: '',
        city: ''
      },
      rules: {
        timestamp: [{ type: 'date', required: true, message: '时间是必需的', trigger: 'change' }],
        cname: [{ required: true, message: '名字是必需的', trigger: 'blur' }],
        boolean_sex: [{ required: true, message: '性别是必需的', trigger: 'change' }],
        regexp_phone: [{ required: true, trigger: 'blur', validator: validatePhoneNum }],
        email: [{ required: true, trigger: 'blur', validator: validateEmail }],
        city: [{ required: true, message: '地址是必需的', trigger: 'blur' }]
      },
      dialogFormVisible: false,
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      this.listLoading = true;
      const { data } = await fetchList(this.listQuery);
      const items = data.items;
      this.total = data.total;
      this.list = items.map(v => {
        this.$set(v, 'edit', false); // https://vuejs.org/v2/guide/reactivity.html
        v.originalRemark = v.remark; //  will be used when user click the cancel botton
        return v;
      });
      this.listLoading = false;
    },
    cancelEdit(row) {
      row.remark = row.originalRemark;
      row.edit = false;
      this.$message({
        message: '取消修改',
        type: 'warning'
      });
    },
    confirmEdit(row) {
      row.edit = false;
      row.originalRemark = row.remark;
      this.$message({
        message: '修改成功',
        type: 'success'
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        name: '',
        boolean_sex: '',
        regexp_phone: '',
        email: '',
        city: '',
        edit: false
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const temp = this.temp;
          temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          temp.author = 'vue-element-admin';
          createArticle(temp).then(() => {
            temp.originalRemark = temp.remark;
            this.list.unshift(temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: '成功',
              message: '添加成功',
              type: 'success',
              duration: 2000
            });
          });
        }
      });
    },
    handleDownload() {
      this.downloadLoading = true;
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['时间', '重要级', '用户名', '性别', '电话', '邮箱', '所在地', '备注'];
        const filterVal = ['timestamp', 'importance', 'cname', 'boolean_sex', 'regexp_phone', 'email', 'city', 'remark'];
        const data = this.formatJson(filterVal);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'user-list'
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j]);
        } else {
          return v[j];
        }
      }));
    }
  }
};
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
